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
SRC_URL=$(src_env WORDPRESS_URL);  SRC_URL=${SRC_URL:-http://localhost}
SRC_NEXT_URL=$(src_env NEXT_URL)

load_instance_env
assert_container_dir "${SRC_CODE}_wp" "$(cd "$SRC/wordpress" && pwd -P)" require
assert_container_dir "${PROJECT_CODE}_wp" "$(pwd -P)" require

# Staged through a temp file, not piped: a pipeline reports only the import's
# status, so a failed export would import a truncated dump and call it success.
TMP=$(mktemp "${TMPDIR:-/tmp}/superstack-seed.XXXXXX")
trap 'rm -f "$TMP"' EXIT
docker exec "${SRC_CODE}_wp" wp db export - > "$TMP"
docker exec -i "${PROJECT_CODE}_wp" wp db import - < "$TMP"

# Replace the more specific URL first: a bare "http://localhost" source URL is
# a prefix of "http://localhost:3000", so doing it the other way round leaves
# the port dangling ("http://localhost:8083:3000") on every stored frontend URL.
if [ -n "$SRC_NEXT_URL" ] && [ -n "$NEXT_URL" ] && [ "$SRC_NEXT_URL" != "$NEXT_URL" ]; then
	docker exec "${PROJECT_CODE}_wp" wp search-replace "$SRC_NEXT_URL" "$NEXT_URL" --all-tables --quiet ||
		echo "WARNING: Next.js URL search-replace failed — content may still point at $SRC_NEXT_URL" >&2
fi

if [ -n "$WORDPRESS_URL" ] && [ "$SRC_URL" != "$WORDPRESS_URL" ]; then
	docker exec "${PROJECT_CODE}_wp" wp search-replace "$SRC_URL" "$WORDPRESS_URL" --all-tables --quiet ||
		echo "WARNING: WordPress URL search-replace failed — content may still point at $SRC_URL" >&2
fi

# The source .env may not exist (seeding from an unconfigured main checkout),
# in which case the replace above could not run. Set it outright, as
# provision.sh does on boot.
if [ -n "$NEXT_URL" ]; then
	docker exec "${PROJECT_CODE}_wp" wp option update next_url "$NEXT_URL" --quiet ||
		echo "WARNING: could not set next_url to $NEXT_URL" >&2
fi

if [ -d "$SRC/wordpress/.data/uploads" ]; then
	mkdir -p ./.data/uploads
	rsync -a --delete "$SRC/wordpress/.data/uploads/" ./.data/uploads/
fi

docker exec "${PROJECT_CODE}_wp" wp cache flush --quiet || true
docker exec "${PROJECT_CODE}_wp" wp rewrite flush --hard --quiet || true

echo "Seeded from $SRC"
