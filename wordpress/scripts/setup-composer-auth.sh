#!/bin/sh

set -eu

if [ "$#" -ne 3 ]; then
  echo "Usage: $0 <domain> <username> <password>"
  exit 1
fi

DOMAIN="$1"
AUTH_USER="$2"
AUTH_PASS="$3"

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ -z "$DOMAIN" ] || [ -z "$AUTH_USER" ] || [ -z "$AUTH_PASS" ]; then
  echo "Error: domain, username, and password must be non-empty."
  exit 1
fi

# If auth.json was accidentally created as a directory, remove it so Composer can write the file.
if [ -d auth.json ]; then
  rm -rf auth.json
fi

[ -f auth.json ] || echo "{}" > auth.json


docker compose -f docker-compose.yml run --rm --no-deps \
  -e DOMAIN="$DOMAIN" -e AUTH_USER="$AUTH_USER" -e AUTH_PASS="$AUTH_PASS" \
  wp sh -lc 'composer config --auth "http-basic.$DOMAIN" "$AUTH_USER" "$AUTH_PASS"'

chmod 600 auth.json || true

echo "Configured Composer auth for $DOMAIN"