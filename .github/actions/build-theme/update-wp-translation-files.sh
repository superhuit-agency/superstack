#!/bin/sh

#===========================================
# Update WP translation files script
#===========================================
#
# Requirements:
# - [jq](https://stedolan.github.io/jq)
#
#===========================================

# vars
ASSETS_MANIFEST_FILE="./wordpress/theme/static/manifest.json" # file is automatically created inside the static folder when we build our theme assets
SUPT_TRANSLATION_FILE_FR=$(find ./wordpress/theme/languages -type f -name '*supt-fr_FR-*.json') # find file which contains supt-fr_FR in it (which is the FR of the JSON translation file)

# Get data from Manifest file
ASSETS_MANIFEST_DATA=$(cat "$ASSETS_MANIFEST_FILE" | jq '."editor.js"');

# Remove 1st and last character of the string (which are " because $ASSETS_MANIFEST_DATA = '"editor.***.js"'')
ASSETS_MANIFEST_DATA_FORMATTED=${ASSETS_MANIFEST_DATA#'"'}
ASSETS_MANIFEST_DATA_FORMATTED=${ASSETS_MANIFEST_DATA_FORMATTED%'"'}

# Search and replace
sed -i'.original' -E "s@editor.[a-zA-Z0-9]+\.js@$ASSETS_MANIFEST_DATA_FORMATTED@g" "$SUPT_TRANSLATION_FILE_FR"

# Create MD5 hash from edit.****.js file like WP make-json does to match the servers language hash
MD5_NAME=$(echo -n static/$ASSETS_MANIFEST_DATA_FORMATTED | openssl md5)

# Strip up to "=" sign
MD5_NAME_FORMATTED=${MD5_NAME#*= }

# Rename file to match WP requested filename
mv $SUPT_TRANSLATION_FILE_FR ./wordpress/theme/languages/supt-fr_FR-$MD5_NAME_FORMATTED.json
