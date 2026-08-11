---
description: Author a database migration for the WordPress theme in this headless WordPress + Next.js stack. Use when the user asks to add a migration, says existing content needs updating in the database, or makes a theme change (renamed block, renamed CSS class, changed attribute) that leaves already-saved content on the old shape.
compatibility: Superstack — headless WordPress + Next.js monorepo
---

A migration rewrites content that is **already saved in the database** so it matches a theme change. It is authoring work only — running migrations on servers is `provision.sh`'s job, documented in [`docs/setup/deployment.md`](../../../docs/setup/deployment.md). The runner contract and the full flag list live in [`wordpress/theme/migrations/README.md`](../../../wordpress/theme/migrations/README.md); read it before writing the file.

## Required Pre-Checks

1. **Decide whether a migration is warranted at all.** This is the step that gets skipped. A migration is warranted only when all three hold:
   - Content already saved in the database carries the old shape (a class name, an attribute value, an option, a term). Grep `wp_posts.post_content` on a real database rather than assuming.
   - The theme change does not handle the old shape at render time. A deprecation in the block's `deprecated` array, a fallback in the PHP render callback, or a default in the Next.js component makes the migration unnecessary — prefer those, they cannot fail on a production database.
   - The old shape would visibly break or silently disappear for editors or visitors.

   If any of the three fails, say so and stop. Writing an unnecessary migration is the more expensive mistake: it runs irreversibly against production content.
2. Confirm which theme change the migration accompanies — the migration and that change ship in the same commit, so the database never lags the code that reads it.
3. Confirm the search pattern is specific enough. When several replacements are involved, order the most specific (longest) first so `text-link` is not half-eaten by `text`.

## Step 1 — Scaffold the file

```sh
npm run generate:migration "fix section cards"
```

Writes `wordpress/theme/migrations/<YYYYMMDD_HHMMSS>_fix_section_cards.php` with the docblock, the `ABSPATH` guard and both return forms. Never rename it afterwards — the timestamp prefix is the run order, and the filename is the key the completed-migrations option is stored under.

Fill in the docblock: what the migration does, why, and the commit hash of the accompanying theme change.

## Step 2 — Choose the return form

Keep one of the two forms the template offers and delete the other.

**A callable** is the default choice. It runs with WordPress fully loaded, so `$wpdb`, `WP_Query` and `WP_CLI::runcommand` are all available:

```php
return function () {
	global $wpdb;

	$wpdb->query(
		"UPDATE {$wpdb->posts} SET post_content = REPLACE(post_content, 'old-value', 'new-value')"
	);
};
```

**An array of WP-CLI command strings** is worth keeping only when the whole migration is one or two clean `search-replace` calls with no quoting to fight:

```php
return [
	'search-replace "old-value" "new-value" --report-changed-only',
];
```

Switch to the callable as soon as either of these appears:

- **The table prefix.** Hardcoding `wp_` in a `db query` silently matches nothing on a site with a different prefix — and the migration is still recorded as completed, so the damage is invisible and permanent. Use `$wpdb->posts`, `$wpdb->postmeta`, `$wpdb->prefix` instead.
- **Escaping.** A regex or JSON fragment inside a shell string inside a PHP string means backslash arithmetic. Write PHP.

## Step 3 — Make it re-runnable

A migration that throws is recorded with `status: failed`, which counts as **pending again** — the next deployment runs it a second time, on a database where part of the work may already be done. Write every migration so that second run is harmless:

- Match on the old shape only, so a row already migrated no longer matches.
- Prefer `REPLACE(...)`-style rewrites and `WHERE ... LIKE '%old-value%'` guards over blanket updates.
- Where a value is computed, check for the target state before writing it.
- Avoid appending: a second run appends twice.

Blocks stored in `post_content` are serialised block comments — a targeted string replacement on the exact class or attribute is safer than re-serialising the block.

## Step 4 — Test against a copy of the production database

Never let the first real run happen on production. On a local site restored from a production dump:

```sh
wp spck migrate --dry-run                      # confirms the runner sees the file
wp spck migrate --only=<filename>.php          # runs just this one, whatever its recorded state
wp spck migrate --only=<filename>.php          # run it a second time — Step 3's promise
wp spck migrate --status                       # status "completed", with ran_at and duration
```

`--only` re-runs a single migration by filename regardless of recorded state, which is what makes the idempotency check above possible. Between runs, verify the content itself: query the affected rows, and load an affected page in Next.js.

## Verification Checklist

1. `php -l wordpress/theme/migrations/<filename>.php`
2. Migration ran clean against a production-database copy, and running it twice changed nothing the second time.
3. `wp spck migrate --status` shows it `completed`.
4. Affected content renders correctly in WordPress admin and in Next.js.
5. Docblock names the accompanying theme change.
6. No other migration file was modified — migrations that already ran are immutable history.

## Output Format

1. Why a migration is warranted (the three Pre-Check conditions), or why it is not.
2. The migration file created and the theme change it accompanies.
3. Return form chosen and why.
4. Verification results, including the second-run check.
