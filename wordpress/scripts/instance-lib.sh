#!/bin/sh

# Shared helpers for the per-instance database scripts.
# Callers must have cd'ed to the wordpress/ directory first.

# Load wordpress/.env (written by scripts/setup-instance.sh) so PROJECT_CODE
# and WORDPRESS_URL point at this checkout's instance.
load_instance_env() {
	if [ -f ./.env ]; then
		set -a
		. ./.env
		set +a
	fi
	PROJECT_CODE=${PROJECT_CODE:="spck"}
}

# PROJECT_CODE falls back to "spck", which every other superstack-derived
# project on this machine also uses by default. Refuse to export or overwrite
# the database of a container that belongs to a different checkout.
assert_own_container() {
	if ! docker inspect "$1" >/dev/null 2>&1; then
		echo "ERROR: container '$1' is not running — run 'npm start' in wordpress/ first." >&2
		exit 1
	fi

	owner=$(docker inspect "$1" --format '{{index .Config.Labels "com.docker.compose.project.working_dir"}}')
	if [ -n "$owner" ] && [ "$owner" != "$(pwd)" ]; then
		echo "ERROR: container '$1' belongs to another checkout:" >&2
		echo "         $owner" >&2
		echo "       Run 'sh scripts/setup-instance.sh <n>' from the repo root to give this" >&2
		echo "       checkout its own PROJECT_CODE, then start it." >&2
		exit 1
	fi
}
