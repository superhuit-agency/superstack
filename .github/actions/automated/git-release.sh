#!/bin/bash

# Check input parameters
if [ "$#" -lt 4 ]; then
  echo "Usage: $0 <repository> <github_token> <version> <changelog_path> [--draft]"
  exit 1
fi

# Variables
REPO=$1 # Repo should be the 1st argument
TOKEN=$2  # Pass GitHub token as the second script argument
VERSION=$3 # New version used for the release (excluding the v prefix)
changelogfile=$4 # Path to the changelog to read the description
draft_mode=$5 # Path to the changelog to read the description

# Read the description of last version written in the changelog
DESCRIPTION=$(.github/actions/automated/check-changelog.sh $changelogfile 0.0.0 --desc)

is_draft=false
if [[ "$draft_mode" == "--draft" ]]; then
	is_draft=true
fi

# Get the latest merged PR
PR_TITLE=$(curl -H "Authorization: token $TOKEN" \
                -H "Accept: application/vnd.github.v3+json" \
                "https://api.github.com/repos/$REPO/pulls?state=closed&base=main&sort=updated&direction=desc" \
                -s | jq -r '[.[] | select(.merged_at != null)][0].title')

RELEASE_DATA=$(jq -n \
                  --arg tag "v$VERSION" \
                  --arg name "v$VERSION - $PR_TITLE" \
                  --arg body "$DESCRIPTION" \
                  --argjson draft $is_draft \
									'{tag_name: $tag, name: $name, body: $body, draft: $draft}')

curl -H "Authorization: token $TOKEN" \
     -H "Content-Type: application/json" \
     -H "Accept: application/vnd.github.v3+json" \
     -X POST \
     -d "$RELEASE_DATA" \
     "https://api.github.com/repos/$REPO/releases"

echo "A draft release for v$VERSION was sent to $REPO with the following content:"
echo "$PR_TITLE"
echo "$DESCRIPTION"
