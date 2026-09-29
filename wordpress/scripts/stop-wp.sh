#!/bin/sh

# Change to the wordpress directory (parent of this script's location)
cd "$(dirname "$0")/.." || exit

. ./scripts/instance-lib.sh
load_instance_env
assert_container_dir "${PROJECT_CODE}_wp" "$(pwd -P)"

COMPOSE="docker compose"

echo ""
echo "Stopping WordPress..."
echo "-------"
sleep 1
$COMPOSE -f docker-compose.yml down
