#!/usr/bin/env sh
set -e

THEME_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WORDPRESS_DIR="$(cd "$THEME_DIR/.." && pwd)"
THEME_NAME="${THEME_NAME:-superstack}"
SCRIPT_IN_CONTAINER="/var/www/html/wp-content/themes/${THEME_NAME}/scripts/generate-theme-css.php"

run_local() {
	cd "$THEME_DIR" && php scripts/generate-theme-css.php
}

run_docker() {
	cd "$WORDPRESS_DIR" && docker compose exec -T wp wp eval-file "$SCRIPT_IN_CONTAINER"
}

if [ -n "${WP_LOAD_PATH:-}" ] && [ -f "${WP_LOAD_PATH}" ]; then
	run_local
	exit 0
fi

if [ -f '/var/www/html/wp-load.php' ]; then
	run_local
	exit 0
fi

if command -v docker >/dev/null 2>&1; then
	if (cd "$WORDPRESS_DIR" && docker compose exec -T wp true >/dev/null 2>&1); then
		if ! (cd "$WORDPRESS_DIR" && docker compose exec -T wp wp core is-installed --quiet >/dev/null 2>&1); then
			echo 'WordPress is not installed in the container yet.' >&2
			echo 'Run project start/provision first.' >&2
			exit 1
		fi
		run_docker
		exit 0
	fi
fi

echo '' >&2
echo 'Theme CSS generation needs a running WordPress bootstrap.' >&2
echo 'Start Docker WP stack or set WP_LOAD_PATH.' >&2
exit 1
