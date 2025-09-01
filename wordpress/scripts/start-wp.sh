#!/bin/sh

COMPOSE="docker compose"
THEME_NAME=${THEME_NAME:="superstack"}
WORDPRESS_ADMIN_EMAIL=${WORDPRESS_ADMIN_EMAIL:="tech+superstack@superhuit.ch"}
WORDPRESS_ADMIN_USER=${WORDPRESS_ADMIN_USER:="superstack"}
WORDPRESS_ADMIN_PASSWORD=${WORDPRESS_ADMIN_PASSWORD:="stacksuper"}
DOCKER_COMPOSE_FILE=${DOCKER_COMPOSE_FILE:="docker-compose.yml"}

echo ""
echo "=====================   STARTING WORDPRESS   ====================="
echo ""
sleep 0.2
THEME_NAME=${THEME_NAME} $COMPOSE -f $DOCKER_COMPOSE_FILE up "$@" --build -d --quiet-pull
echo $(docker ps)
echo ""
echo "=============   INSTALLING COMPOSER DEPENDENCIES   ==============="
echo ""
sleep 0.2
$COMPOSE exec wp composer install

echo ""
echo "===================   PROVISIONING WORDPRESS   ==================="
echo ""
sleep 0.2
THEME_NAME=${THEME_NAME} $COMPOSE exec -T wp bash < ./scripts/provision.sh
