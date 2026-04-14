#!/bin/bash
###
# This script is used to download WordPress and extract it to `.data/wp`
# It is called by the prestart script in `package.json`
# The goal is to have a copy of WordPress locally in order
# to enable to debug WordPress file with xdebug.
# See `pathMappings` property in `.vscode/launch.json` pathMappings
###

# Change to the wordpress directory (parent of this script's location)
cd "$(dirname "$0")/.." || exit

# Get project version from package.json
VERSION=$(grep "^  \"version\": \"[0-9.]*\"," ./package.json | sed -E 's/.*"version": "([0-9.]*)",.*/\1/')

echo "------------------------------------------------------------------\033[33m"
echo "                                      _            _              "
echo "                                     | |___       | |             "
echo "         ___ _   _ _ __  ___ _ __ ___|  __/__  ___| | __          "
echo "        / __| | | | '_ \/ _ \ ' _/ __| |/ _  |/ __| |/ /          "
echo "        \__ \ |_| | |_)   __/ |  \__ \ | (_| | (__|   <           "
echo "       /____/\__,_| .__/\___|_|  |___/_|\__,_|\___|_|\_\  \033[1mv$VERSION\033[0m\033[33m"
echo "                  | |                                             "
echo "                  |_|\033[0m       -- B Y -- \033[32m"
echo "    _____ __  ___ ______ ______ ______ __   ___ __  ___ __ _______"
echo "  /  ___/  / /  /  __  /  ____/  __  /  /__/  /  / /  /  /__   __/"
echo " /___  /  /_/  /  ____/  ___//     _/   __   /  /_/  /  /  /  /   "
echo "/_____/_______/__/   /______/__/ \_/__/  /__/_______/__/  /__/    "
echo "\033[0m"
echo "------------------------------------------------------------------"
echo "              github.com/superhuit-agency/superstack"
echo "------------------------------------------------------------------"
echo ""

WP_PATH="./.data/wp"

# Extract WordPress version from Dockerfile
WP_VERSION=$(grep "^FROM wordpress:" ./Dockerfile | sed -E 's/FROM wordpress:([0-9.]+).*/\1/')

if [ -z "$WP_VERSION" ]; then
    echo "Error: Could not extract WordPress version from Dockerfile"
    exit 1
fi

# Check if wp-includes/version.php exists and if the version matches
if [ -f "$WP_PATH/wp-includes/version.php" ]; then
	CURRENT_VERSION=$(grep "\$wp_version =" "$WP_PATH/wp-includes/version.php" | sed -E "s/.*'([0-9.]+)'.*/\1/")
	if [ "$CURRENT_VERSION" = "$WP_VERSION" ]; then
		echo "Using WordPress $WP_VERSION (already installed)."
		exit 0
	else
		echo "Using WordPress $WP_VERSION but installed version ($CURRENT_VERSION) doesn't match."
	fi
fi

# Ensure the .data/wp directory exists
mkdir -p $WP_PATH

# Download WordPress and extract it to .data/wp
echo "Downloading WordPress $WP_VERSION..."
curl -s -L https://wordpress.org/wordpress-$WP_VERSION.tar.gz | tar xz -C $WP_PATH --strip-components=1

echo "✔"
echo ""
echo "Using WordPress $WP_VERSION (downloaded successfully)"
