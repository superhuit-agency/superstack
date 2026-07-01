#!/bin/sh
set -e

# Go to the wordpress directory.
cd "$(dirname "$0")/.." || exit

# Write CSS to next/public/css.
OUTPUT_FILE="../next/public/css/theme-generated.css"
WORDPRESS_PATH=${WORDPRESS_PATH:="$(pwd)"}
WPCLI="${WPCLI:-}"

# Build the WPCLI command.
if [ -z "${WPCLI}" ]; then
	if [ -x "$(command -v wp)" ]; then
		WPCLI="wp --path=""$WORDPRESS_PATH"""
	else
		WPCLI="php wp-cli.phar --path=""$WORDPRESS_PATH"""
		[ ! -f wp-cli.phar ] && curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
	fi
fi

# Stop if WordPress is not reachable (or skip in soft mode).
if ! $WPCLI core is-installed --quiet >/dev/null 2>&1; then
	echo 'WordPress is not installed/reachable for the selected WPCLI target.' >&2
	echo 'Set WPCLI (or WORDPRESS_PATH) to match your environment.' >&2
	if [ "${THEME_CSS_SOFT:-}" = "1" ]; then
		echo 'Skipping theme CSS generation (THEME_CSS_SOFT=1).' >&2
		exit 0
	fi
	exit 1
fi

# Create next/public/css if it does not exist.
mkdir -p "../next/public/css"

# Generate CSS via registered WP-CLI command.
css="$($WPCLI spck theme-css)"

if [ -z "$css" ]; then
	echo 'Generated stylesheet is empty after filtering; aborting file write.' >&2
	exit 1
fi

# Write CSS to the output file.
printf "%s" "$css" > "$OUTPUT_FILE"

# Print file size and output path.
css_bytes="${#css}"
css_kb="$(awk -v bytes="$css_bytes" 'BEGIN { printf "%.1f", bytes / 1024 }')"
echo "Full theme CSS generated (${css_kb} KB)"
echo "Saved to: $OUTPUT_FILE"
