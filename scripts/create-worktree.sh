#!/bin/sh

# Creates a detached git worktree at ../<repo>-wt<n>, copies the heavy
# gitignored dependency directories from this checkout, and generates the
# instance env files.
#
# Usage: sh scripts/create-worktree.sh <instance-number 1-9> [branch-or-ref]

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
N=${1:?"usage: sh scripts/create-worktree.sh <instance-number 1-9> [branch-or-ref]"}
REF=${2:-$(git -C "$ROOT" rev-parse --abbrev-ref HEAD)}
DEST="$(dirname "$ROOT")/$(basename "$ROOT")-wt$N"

if [ -e "$DEST" ]; then
	echo "ERROR: $DEST already exists" >&2
	exit 1
fi

git -C "$ROOT" worktree add --detach "$DEST" "$REF"

# setup-instance.sh is run from the checked-out ref, so a ref from before this
# tooling landed would copy gigabytes and only then fail. Check first.
if [ ! -f "$DEST/scripts/setup-instance.sh" ]; then
	git -C "$ROOT" worktree remove "$DEST" --force
	echo "ERROR: $REF has no scripts/setup-instance.sh — it predates this tooling." >&2
	exit 1
fi

# theme/static is deliberately not copied: it is a build output, and shipping
# one branch's compiled assets into another branch's worktree produces a site
# that looks correct and is not.
echo "Copying gitignored dependencies…"
for d in node_modules next/node_modules wordpress/node_modules wordpress/plugins wordpress/theme/node_modules; do
	if [ -d "$ROOT/$d" ]; then
		mkdir -p "$DEST/$d"
		cp -Rc "$ROOT/$d/." "$DEST/$d/" 2>/dev/null || cp -R "$ROOT/$d/." "$DEST/$d/"
	fi
done

sh "$DEST/scripts/setup-instance.sh" "$N"
echo ""
echo "Worktree ready: $DEST"
echo ""
echo "Dependencies were copied from this checkout as-is. If they are older than"
echo "what $REF pins, run 'npm install' in the new worktree before building."
