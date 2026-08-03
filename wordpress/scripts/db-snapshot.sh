#!/bin/sh

# Exports this instance's database to wordpress/.data/snapshot.sql
# so another instance can seed itself from it (see db-seed.sh).
#
# Usage: sh scripts/db-snapshot.sh [output-file]

set -e
cd "$(dirname "$0")/.." || exit 1
. ./scripts/instance-lib.sh

load_instance_env
assert_own_container "${PROJECT_CODE}_wp"

OUT=${1:-.data/snapshot.sql}
mkdir -p "$(dirname "$OUT")"

docker exec "${PROJECT_CODE}_wp" wp db export - > "$OUT"
echo "Database exported to wordpress/$OUT"
