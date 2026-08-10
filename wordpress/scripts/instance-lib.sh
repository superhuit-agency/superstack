#!/bin/sh

# Shared helpers for the per-instance scripts.
# Callers must have cd'ed to the wordpress/ directory first.

load_instance_env() {
	if [ -f ./.env ]; then
		set -a
		. ./.env
		set +a
	fi
	PROJECT_CODE=${PROJECT_CODE:="spck"}
}

# PROJECT_CODE falls back to "spck", which every superstack-derived project on
# this machine also uses by default. Two checkouts sharing it also share their
# compose project identity, so `docker compose up` in the second would recreate
# the first's running containers rather than clash with them. Refuse to act on
# a container owned by another checkout — including an unlabelled one, since
# there is no way to tell whose it is.
#
# Usage: assert_container_dir <container> <wordpress/ dir, from pwd -P> [require]
#        "require" also refuses when the container is not running at all.
assert_container_dir() {
	if ! docker inspect "$1" >/dev/null 2>&1; then
		[ "${3:-}" = require ] || return 0
		echo "ERROR: container '$1' is not running — run 'npm start' in its wordpress/ first." >&2
		exit 1
	fi

	# Docker stores the symlink-resolved path, hence pwd -P in the caller.
	owner=$(docker inspect "$1" --format '{{index .Config.Labels "com.docker.compose.project.working_dir"}}')
	[ "$owner" = "$2" ] && return 0

	echo "ERROR: container '$1' belongs to another checkout:" >&2
	echo "         ${owner:-<no compose ownership label>}" >&2
	echo "       Run 'sh scripts/setup-instance.sh <n>' there to give it its own" >&2
	echo "       PROJECT_CODE, then start it." >&2
	exit 1
}
