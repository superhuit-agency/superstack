#!/bin/sh

# Change to the wordpress directory (parent of this script's location)
cd "$(dirname "$0")/.." || exit

COMPOSE="docker compose"
THEME_NAME=${THEME_NAME:="superstack"}
PROJECT_CODE=${PROJECT_CODE:="spck"}

echo ""
echo "=====================   STARTING WORDPRESS   ====================="
echo ""
sleep 0.5
THEME_NAME=${THEME_NAME} PROJECT_CODE=${PROJECT_CODE} $COMPOSE -f docker-compose.yml up "$@" --build -d --quiet-pull

echo ""
echo "=============   INSTALLING COMPOSER DEPENDENCIES   ==============="
echo ""
sleep 0.5
$COMPOSE exec wp composer install

echo ""
echo "===================   PROVISIONING WORDPRESS   ==================="
echo ""
sleep 0.5
THEME_NAME=${THEME_NAME} $COMPOSE exec -T wp bash < ./scripts/provision.sh
