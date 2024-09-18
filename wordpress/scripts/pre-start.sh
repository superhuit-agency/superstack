#!/bin/bash
###
# This script is used to download WordPress and extract it to `.data/wp`
# It is called by the prestart script in `package.json`
# The goal is to have a copy of WordPress locally in order
# to enable to debug WordPress file with xdebug.
# See `pathMappings` property in `.vscode/launch.json` pathMappings
###

WP_PATH="./.data/wp"
RELEASE_BELT_USER=${RELEASE_BELT_USER}
RELEASE_BELT_PWD=${RELEASE_BELT_PWD}

# Extract WordPress version from Dockerfile
WP_VERSION=$(grep "^FROM wordpress:" ./Dockerfile | sed -E 's/FROM wordpress:([0-9.]+).*/\1/')

if [ -z "$WP_VERSION" ]; then
    echo "Error: Could not extract WordPress version from Dockerfile"
    exit 1
fi

echo "Detected WordPress version: $WP_VERSION"

# Check if wp-includes/version.php exists and if the version matches
if [ -f "$WP_PATH/wp-includes/version.php" ]; then
	CURRENT_VERSION=$(grep "\$wp_version =" "$WP_PATH/wp-includes/version.php" | sed -E "s/.*'([0-9.]+)'.*/\1/")
	if [ "$CURRENT_VERSION" = "$WP_VERSION" ]; then
		echo "WordPress $WP_VERSION is already installed. Skipping download."
		exit 0
	else
		echo "Installed WordPress version ($CURRENT_VERSION) doesn't match required version ($WP_VERSION)."
	fi
fi

# Ensure the .data/wp directory exists
mkdir -p $WP_PATH

# Download WordPress and extract it to .data/wp
curl -s -L https://wordpress.org/wordpress-$WP_VERSION.tar.gz | tar xz -C $WP_PATH --strip-components=1

echo "WordPress $WP_VERSION downloaded successfully"


echo ""
echo "Authenticating Composer to release belt..."
echo "-------"
sleep 1
$COMPOSE exec wp composer config http-basic.release-belt.superhuit.ch ${RELEASE_BELT_USER} ${RELEASE_BELT_PWD}
