#!/bin/sh

# Seeds this instance with the database + uploads of another checkout.
# The source checkout must have run 'sh scripts/db-snapshot.sh' first
# and this instance's containers must be running (npm start).
#
# Usage: sh scripts/db-seed.sh /path/to/source-checkout

set -e
cd "$(dirname "$0")/.." || exit 1
. ./scripts/instance-lib.sh

SRC=${1:?"usage: sh scripts/db-seed.sh /path/to/source-checkout"}
SNAPSHOT="$SRC/wordpress/.data/snapshot.sql"

if [ ! -f "$SNAPSHOT" ]; then
	echo "ERROR: no snapshot at $SNAPSHOT — run 'sh scripts/db-snapshot.sh' in the source checkout first." >&2
	exit 1
fi

load_instance_env
assert_own_container "${PROJECT_CODE}_wp"

docker exec -i "${PROJECT_CODE}_wp" wp db import - < "$SNAPSHOT"

SRC_URL=$(grep '^WORDPRESS_URL=' "$SRC/wordpress/.env" 2>/dev/null | cut -d= -f2-)
SRC_URL=${SRC_URL:-http://localhost}
if [ -n "$WORDPRESS_URL" ] && [ "$SRC_URL" != "$WORDPRESS_URL" ]; then
	docker exec "${PROJECT_CODE}_wp" wp search-replace "$SRC_URL" "$WORDPRESS_URL" --all-tables --quiet || true
fi

if [ -d "$SRC/wordpress/.data/uploads" ]; then
	mkdir -p ./.data/uploads
	rsync -a --delete "$SRC/wordpress/.data/uploads/" ./.data/uploads/
fi

docker exec "${PROJECT_CODE}_wp" wp cache flush --quiet || true
docker exec "${PROJECT_CODE}_wp" wp rewrite flush --hard --quiet || true

echo "Seeded from $SRC"
