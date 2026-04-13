#!/bin/sh

# Change to the wordpress directory (parent of this script's location)
cd "$(dirname "$0")/.." || exit

COMPOSE="docker compose"

echo ""
echo "Stopping WordPress..."
echo "-------"
sleep 1
$COMPOSE -f docker-compose.yml down
