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
echo "Authenticating Composer to release belt with user $RELEASE_BELT_USER..."
echo "-------"
sleep 1
$COMPOSE exec wp composer config http-basic.release-belt.superhuit.ch $RELEASE_BELT_USER $RELEASE_BELT_PWD
$COMPOSE exec wp composer config github-oauth.github.com $COMPOSER_GITHUB_TOKEN

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
