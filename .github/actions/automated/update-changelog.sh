#!/bin/bash

# Usage: script.sh <path_to_changelog> <last_version> [--version|--desc]

# Check input parameters
if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <path_to_changelog> <log_version> <new_version> "
  exit 1
fi

REPO=$1 # Repo should be the 1st argument
TOKEN=$2  # Pass GitHub token as the second script argument
changelog_path="$3"
log_version="$4"
new_version=$5

# Read the changelog file
if [ ! -f "$changelog_path" ]; then
  echo "Changelog file does not exist."
  exit 1
fi

# Initialize variables
new_version_found=false
capture_description=false
description=""

# Read the file line by line
while IFS= read -r line || [[ -n "$line" ]]; do
  if [[ $line =~ ^##\ ([0-9]+\.[0-9]+\.[0-9]+) ]]; then
    # When a version header is found
    if $new_version_found; then
      # If we found the new version in the previous iteration, stop reading further
      break
    fi

    version_number="${BASH_REMATCH[1]}"
    if [[ "$version_number" == "$new_version" ]]; then
      # Start capturing the description for the next version found
      new_version_found=true
    else
      # Stop capturing if this version is less than or equal to the last known version
      break
    fi
  elif $new_version_found; then
    # Capture the description lines
    description+="$line"$'\n'
  fi
done < "$changelog_path"

if $new_version_found; then
	echo "Changelog was already containing information for v$new_version. Good job."  # Trim trailing newline
	exit 0
else

	DATE=$(date "+%Y-%m-%d")
	description="## $new_version - $DATE\n\n"

	# Get the commit SHA of the last release tag
	LAST_TAG_SHA=$(curl -H "Authorization: token $TOKEN" \
	                    -H "Accept: application/vnd.github.v3+json" \
	                    "https://api.github.com/repos/$REPO/git/refs/tags/v$log_version" \
	                    -s | jq -r '.object.sha // empty')

	# Get commits since last release
	if [ -n "$LAST_TAG_SHA" ]; then

		# Get the date of the last release commit
		LAST_TAG_DATE=$(curl -H "Authorization: token $TOKEN" \
		                     -H "Accept: application/vnd.github.v3+json" \
		                     "https://api.github.com/repos/$REPO/git/commits/$LAST_TAG_SHA" \
		                     -s | jq -r '.author.date')
	fi

	if [ -n "$LAST_TAG_DATE" ] && [ "$LAST_TAG_DATE" != "null" ]; then
		echo "Getting commits since last version $log_version (after $LAST_TAG_DATE)"
		COMMITS=$(curl -H "Authorization: token $TOKEN" \
										-H "Accept: application/vnd.github.v3+json" \
										"https://api.github.com/repos/$REPO/commits?sha=main&since=$LAST_TAG_DATE" \
										-s | jq -r '.[] | select(.sha != "'$LAST_TAG_SHA'") | "- \(.commit.message) (\(.commit.author.name))"')
	else
		echo "Getting last 10 commits"
		COMMITS=$(curl -H "Authorization: token $TOKEN" \
										-H "Accept: application/vnd.github.v3+json" \
										"https://api.github.com/repos/$REPO/commits?sha=main" \
										-s | jq -r '.[] | "- \(.commit.message) (\(.commit.author.name))"' | head -n 10)
	fi

	if [[ $COMMITS =~ [^[:space:]] ]]; then
		echo "Updating Changelog for $new_version with list of commits:"
		echo "$COMMITS"
		description+="$COMMITS\n\n"
	else
		echo "Updating Changelog for $new_version wihtout any description."
	fi

	awk -v line=2 -v text="$description" '{
			print $0;
			if (NR == line) {
					print text;
			}
	}' $changelog_path > $changelog_path.tmp
	mv $changelog_path.tmp $changelog_path

	exit 0
fi
