#!/bin/sh

COMPOSE="docker compose"

echo ""
echo "Starting WordPress..."
echo "-------"
sleep 1
$COMPOSE -f docker-compose.yml up "$@" --build -d

echo ""
echo "Installing Composer dependencies..."
echo "-------"
sleep 1
$COMPOSE exec wp composer install

echo ""
echo "Provisioning WordPress..."
echo "-------"
sleep 1
$COMPOSE exec -T wp bash < ./scripts/provision.sh
