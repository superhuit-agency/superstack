#!/bin/sh

COMPOSE="docker compose"
THEME_NAME=${THEME_NAME:="superstack"}
WORDPRESS_ADMIN_EMAIL=${WORDPRESS_ADMIN_EMAIL:="tech+superstack@superhuit.ch"}
WORDPRESS_ADMIN_USER=${WORDPRESS_ADMIN_USER:="superstack"}
WORDPRESS_ADMIN_PASSWORD=${WORDPRESS_ADMIN_PASSWORD:="stacksuper"}

echo ""
echo "Starting WordPress..."
echo "-------"
sleep 1
THEME_NAME=${THEME_NAME} $COMPOSE -f docker-compose.yml up "$@" --build -d

echo ""
echo "Installing Composer dependencies..."
echo "-------"
sleep 1
$COMPOSE exec wp composer install

echo ""
echo "Provisioning WordPress..."
echo "-------"
sleep 1
THEME_NAME=${THEME_NAME} $COMPOSE exec -T wp bash < ./scripts/provision.sh
