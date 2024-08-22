#!/bin/bash

# Usage: script.sh <path_to_changelog> <last_version> [--version|--desc]

# Check input parameters
if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <path_to_changelog> <last_version> [--version|--desc]"
  exit 1
fi

changelog_path="$1"
last_version="$2"
mode=$3

# Read the changelog file
if [ ! -f "$changelog_path" ]; then
  echo "Changelog file does not exist."
  exit 1
fi

# Initialize variables
new_version_found=false
capture_description=false
description=""

compare_versions() {
    # Usage: compare_versions <version1> <version2>
    # Outputs: 1 if version1 > version2
    #          0 if version1 == version2
    #         -1 if version1 < version2
		awk -v ver1="$1" -v ver2="$2" 'BEGIN {
        split(ver1, a, ".");
        split(ver2, b, ".");
        for (i = 1; i <= length(a) || i <= length(b); i++) {
            if (a[i] + 0 < b[i] + 0) {
                print -1;
                exit;
            }
            else if (a[i] + 0 > b[i] + 0) {
                print 1;
                exit;
            }
        }
        print 0;
    }'
}

# Read the file line by line
while IFS= read -r line || [[ -n "$line" ]]; do
  if [[ $line =~ ^##\ ([0-9]+\.[0-9]+\.[0-9]+) ]]; then
    # When a version header is found
    if $new_version_found; then
      # If we found the new version in the previous iteration, stop reading further
      break
    fi

    new_version="${BASH_REMATCH[1]}"
    comparison_result=$(compare_versions $new_version $last_version)
    if [[ $comparison_result -eq 0 || $comparison_result -eq -1 ]]; then
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

# Output based on mode
case "$mode" in
  "--version")
		# Check if a new version was found
		if ! $new_version_found; then
	    echo "$new_version"
		else
			echo "patch"
		fi
		exit 0
		;;
  "--desc")
# Trim trailing newlines
		while [[ "$description" =~ $'\n'$ ]]; do
				description="${description%$'\n'}"
		done

		# Trim leading newlines
		while [[ "$description" = $'\n'* ]]; do
				description="${description#*$'\n'}"
		done
    echo "$description"
    ;;
  *)
    if [ -n "$mode" ]; then
      echo "Invalid option: $mode"
      exit 1
    fi
    # Error of Do nothing if no mode specified
		if ! $new_version_found; then
			echo "Error - The changelog file doesn't conain any entry over $last_version."
      exit 1
		fi
		echo "Success - A changelog entry was found for v$new_version. Good job!"
    ;;
esac
exit 0
