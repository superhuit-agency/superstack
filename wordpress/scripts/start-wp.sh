#!/bin/sh

COMPOSE="docker compose"
THEME_NAME=${THEME_NAME:="superstack"}
PROJECT_CODE=${PROJECT_CODE:="spck"}

echo ""
echo "Starting WordPress..."
echo "-------"
sleep 1
THEME_NAME=${THEME_NAME} PROJECT_CODE=${PROJECT_CODE} $COMPOSE -f docker-compose.yml up "$@" --build -d

echo ""
echo "Installing Composer dependencies..."
echo "-------"
sleep 1
$COMPOSE exec wp composer install

echo ""
echo "Provisioning WordPress..."
echo "-------"
sleep 1
WORDPRESS_SSH_PATH="$(pwd)" THEME_NAME=${THEME_NAME} $COMPOSE exec -T wp bash < ./scripts/provision.sh
