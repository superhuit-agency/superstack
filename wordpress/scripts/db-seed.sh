#!/bin/sh

# Copies the database + uploads of another checkout into this instance.
# Both checkouts must be running (npm start in wordpress/).
#
# Usage: sh wordpress/scripts/db-seed.sh /path/to/source-checkout

set -e
ORIG_PWD=$(pwd)
cd "$(dirname "$0")/.." || exit 1
. ./scripts/instance-lib.sh

SRC=${1:?"usage: sh wordpress/scripts/db-seed.sh /path/to/source-checkout"}
# The cd above moved us, so a relative source path has to be anchored to
# wherever the caller was standing, not to this instance's wordpress/.
case "$SRC" in
	/*) ;;
	*) SRC="$ORIG_PWD/$SRC" ;;
esac
[ -d "$SRC/wordpress" ] ||
	{ echo "ERROR: $SRC is not a superstack checkout (no wordpress/ directory)." >&2; exit 1; }

# The source has no .env when it is an unconfigured main checkout — the most
# common case. Return empty rather than letting sed's failure trip set -e.
SRC_ENV="$SRC/wordpress/.env"
src_env() {
	[ -f "$SRC_ENV" ] || return 0
	sed -n "s/^$1=//p" "$SRC_ENV"
}
SRC_CODE=$(src_env PROJECT_CODE); SRC_CODE=${SRC_CODE:-spck}

load_instance_env
# An unconfigured target (the main checkout) runs on the docker-compose and
# next/.env.example defaults.
WORDPRESS_URL=${WORDPRESS_URL:-http://localhost}
NEXT_URL=${NEXT_URL:-http://localhost:3000}
assert_container_dir "${SRC_CODE}_wp" "$(cd "$SRC/wordpress" && pwd -P)" require
assert_container_dir "${PROJECT_CODE}_wp" "$(pwd -P)" require

# Read the URLs from the source database itself rather than its .env: they are
# what the stored content actually contains, and an unconfigured source has no
# .env to read. `home` resolves through WP_HOME when the instance defines it.
SRC_URL=$(docker exec "${SRC_CODE}_wp" wp option get home --quiet 2>/dev/null) || SRC_URL=
SRC_NEXT_URL=$(docker exec "${SRC_CODE}_wp" wp option get next_url --quiet 2>/dev/null) || SRC_NEXT_URL=
[ -n "$SRC_URL" ] ||
	{ echo "ERROR: could not read the WordPress URL of ${SRC_CODE}_wp." >&2; exit 1; }

# Staged through a temp file, not piped: a pipeline reports only the import's
# status, so a failed export would import a truncated dump and call it success.
TMP=$(mktemp "${TMPDIR:-/tmp}/superstack-seed.XXXXXX")
trap 'rm -f "$TMP"' EXIT
docker exec "${SRC_CODE}_wp" wp db export - > "$TMP"
docker exec -i "${PROJECT_CODE}_wp" wp db import - < "$TMP"

replace_url() {
	docker exec "${PROJECT_CODE}_wp" wp search-replace "$1" "$2" --all-tables --quiet ||
		echo "WARNING: search-replace '$1' → '$2' failed — content may still point at the source" >&2
}

# A bare "http://localhost" WordPress URL is a prefix of every Next.js URL
# ("http://localhost:3000", and this instance's "http://localhost:310N"), so
# replacing it in either order leaves ports dangling ("http://localhost:8082:3000").
# Park the Next.js URL behind a placeholder while the WordPress URL is replaced.
NEXT_PLACEHOLDER="superstack-seed-next-url.invalid"
[ -n "$SRC_NEXT_URL" ] && replace_url "$SRC_NEXT_URL" "$NEXT_PLACEHOLDER"
[ "$SRC_URL" != "$WORDPRESS_URL" ] && replace_url "$SRC_URL" "$WORDPRESS_URL"
[ -n "$SRC_NEXT_URL" ] && replace_url "$NEXT_PLACEHOLDER" "$NEXT_URL"

# The stored rows may not match what the source actually served (WP_HOME
# overrides home/siteurl in a configured instance), and the main checkout has
# no WP_HOME to fall back on. Set them outright, like provision.sh does next_url.
for opt in home siteurl; do
	docker exec "${PROJECT_CODE}_wp" wp option update "$opt" "$WORDPRESS_URL" --quiet ||
		echo "WARNING: could not set $opt to $WORDPRESS_URL" >&2
done
docker exec "${PROJECT_CODE}_wp" wp option update next_url "$NEXT_URL" --quiet ||
	echo "WARNING: could not set next_url to $NEXT_URL" >&2

if [ -d "$SRC/wordpress/.data/uploads" ]; then
	mkdir -p ./.data/uploads
	rsync -a --delete "$SRC/wordpress/.data/uploads/" ./.data/uploads/
fi

docker exec "${PROJECT_CODE}_wp" wp cache flush --quiet || true
docker exec "${PROJECT_CODE}_wp" wp rewrite flush --hard --quiet || true

echo "Seeded from $SRC"
