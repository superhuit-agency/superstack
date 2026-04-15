#!/bin/sh
set -e

# Go to the wordpress directory.
cd "$(dirname "$0")/.." || exit

# Write CSS to next/public/css.
OUTPUT_FILE="../next/public/css/theme-generated.css"
WORDPRESS_PATH=${WORDPRESS_PATH:="$(pwd)"}
THEME_NAME="${THEME_NAME:-superstack}"
WP_ALIAS="${WP_ALIAS:-@local}"
WPCLI="${WPCLI:-}"

# Build the WPCLI command.
if [ -z "${WPCLI}" ]; then
	if [ -n "${WP_ALIAS}" ]; then
		WPCLI="wp ${WP_ALIAS}"
	elif [ -x "$(command -v wp)" ]; then
		WPCLI="wp --path=""$WORDPRESS_PATH"""
	else
		WPCLI="php wp-cli.phar --path=""$WORDPRESS_PATH"""
		[ ! -f wp-cli.phar ] && curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
	fi
fi

# Stop if WordPress is not reachable.
if ! $WPCLI core is-installed --quiet >/dev/null 2>&1; then
	echo 'WordPress is not installed/reachable for the selected WPCLI target.' >&2
	echo 'Set WPCLI (or WORDPRESS_PATH) to match your environment.' >&2
	exit 1
fi

# Create next/public/css if it does not exist.
mkdir -p "../next/public/css"

# Generate CSS with wp_get_global_stylesheet.
raw_css="$($WPCLI eval "ini_set('display_errors', '0'); error_reporting(E_ERROR | E_PARSE); switch_theme('${THEME_NAME}'); echo wp_get_global_stylesheet(array('variables'));")"

# Keep only content starting from the first :root{.
css="$(printf "%s" "$raw_css" | awk '
	BEGIN { found = 0 }
	{
		if (found) {
			print
		} else {
			pos = index($0, ":root{")
			if (pos > 0) {
				print substr($0, pos)
				found = 1
			}
		}
	}
')"

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
