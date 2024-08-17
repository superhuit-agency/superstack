#!/bin/bash
file_path=$1
version_type=$2
output_version=false

# Check for arguments
for arg in "$@"
do
    case $arg in
        --out)
            output_version=true
            ;;
        --help)
				    echo "Usage: $0 filepath {major|minor|patch|x.x.x} [--out]"
						exit 0
            ;;
        *)
            # Ignore unknown arguments
            ;;
    esac
done

# Extract the current version using awk
current_version=$(awk -F'"' '/"version":/ {print $4; exit}' $file_path)

if [ -z "$current_version" ]; then
	echo "Version not found in $file_path"
	exit 1
fi

# Break the version number into major, minor, and patch
IFS='.' read -r major minor patch <<< "$current_version"

# Increment version based on the specified type
# Construct the new version
new_version="$version_type"
case $version_type in
    major)
			new_version="$((major + 1)).0.0"
			;;
    minor)
			new_version="$major.$((minor + 1)).0"
			;;
    patch)
			new_version="$major.$minor.$((patch + 1))"
			;;
esac

if $output_version; then
	echo "$new_version"
	exit 0
else
	echo "Updating $file_path version from $current_version to: $new_version"
fi

# Update composer.json with the new version using sed
# Using sed with proper handling for both macOS and Linux environments
# macOS requires an empty string with the -i option
# Be careful, only replace the first occurence at the top of the file
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "1,/\"version\": \"$current_version\"/ s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/1" $file_path
else
    # Linux does not require the empty string
    sed -i "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/1" $file_path
fi

# Git commit and push
# git add $file_path
# git commit -m "Update version to $new_version"
# git push origin main  # Adjust the branch name as necessary

# echo "Version updated to $new_version and changes pushed to GitHub."
