#!/bin/sh

COMPOSE="docker compose -f docker-compose.yml"
THEME_NAME=${THEME_NAME:="superstack"}
PROJECT_CODE=${PROJECT_CODE:="spck"}
CONTAINER_NAME=${CONTAINER_NAME:="spck_wp"}

if [ $# -gt 0 ]; then
  if [ "$1" = "up" ]; then
    shift 1
    $COMPOSE up "$@" --build -d

		mutagen sync terminate --all
    mutagen sync create --name="$PROJECT_CODE"-theme $(pwd)/theme docker://"$PROJECT_CODE"_wp/var/www/html/wp-content/themes/$THEME_NAME --default-owner-beta=www-data --default-group-beta=www-data --symlink-mode=ignore
    mutagen sync create --name="$PROJECT_CODE"-plugins $(pwd)/plugins docker://"$PROJECT_CODE"_wp/var/www/html/wp-content/plugins --default-owner-beta=www-data --default-group-beta=www-data
    mutagen sync create --name="$PROJECT_CODE"-uploads $(pwd)/.data/uploads docker://"$PROJECT_CODE"_wp/var/www/html/wp-content/uploads --default-owner-beta=www-data --default-group-beta=www-data

		# Install plugins deps
		docker exec $CONTAINER_NAME composer install

  elif [ "$1" = "down" ]; then
    $COMPOSE down --remove-orphans
    mutagen sync terminate --all
  fi
fi
