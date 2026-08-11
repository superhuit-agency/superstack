# Database Migrations

Migration scripts apply one-time database changes required by theme updates (e.g. renaming CSS classes stored in block markup).

## How it works

- Migrations are PHP files in this directory, each returning either an array of WP-CLI commands (without the `wp` prefix) or a callable, which runs with WordPress fully loaded.
- A custom WP-CLI command (`wp spck migrate`) runs pending migrations in chronological order.
- Completed migrations are tracked in the `spck_completed_migrations` wp_option (not autoloaded) — each migration runs only once. Each entry keeps an audit trail: when it ran, how long it took, and its status.
- During deployment, `provision.sh` checks for pending migrations, creates a DB backup if any exist, then runs them.
- On a **fresh install** `provision.sh` baselines instead: existing migrations are recorded as completed without being executed, since a database created by the current theme has nothing to migrate.

## Creating a migration

1. Scaffold the file from the repository root:

    ```sh
    npm run generate:migration "fix section cards"
    ```

    This writes `wordpress/theme/migrations/<YYYYMMDD_HHMMSS>_fix_section_cards.php` from a template holding the docblock, the `ABSPATH` guard and both return forms. Run it without an argument to be prompted for the description.

    The naming convention, if you write the file by hand instead:

    ```
    YYYYMMDD_HHMMSS_short_description.php
    ```

    The timestamp prefix ensures migrations run in the correct order.

2. Keep one of the two return forms. Either an array of WP-CLI commands (without `wp` prefix)…

    ```php
    <?php

    /**
     * Migration: Short description
     *
     * Longer explanation of what this migration does and why.
     *
     * Related commit: <commit-hash>
     *
     * @package Superstack
     * @since   1.0.0
     */

    if (! defined('ABSPATH')) {
        exit;
    }

    return [
        'search-replace "old-value" "new-value" --report-changed-only',
    ];
    ```

    …or a callable, when the change needs real PHP. Prefer this form as soon as the command string needs escaping gymnastics, or as soon as it needs the table prefix — hardcoding `wp_` in a `db query` silently does nothing on a site with a different prefix, and the migration is still recorded as completed:

    ```php
    return function () {
        global $wpdb;

        $wpdb->query(
            "UPDATE {$wpdb->posts} SET post_content = REPLACE(post_content, 'old-value', 'new-value')"
        );
    };
    ```

3. Commit the migration file alongside the theme changes that require it.

## CLI usage

| Command                           | Description                                           |
| --------------------------------- | ----------------------------------------------------- |
| `wp spck migrate`                 | Run all pending migrations                            |
| `wp spck migrate --dry-run`       | Preview pending migrations without executing          |
| `wp spck migrate --status`        | Show all migrations with state, run date and duration |
| `wp spck migrate --pending-count` | Output number of pending migrations (for scripting)   |
| `wp spck migrate --only=<file>`   | Run one migration by filename, even if it already ran |
| `wp spck migrate --mark-complete` | Record pending migrations as done without running     |

Works with WP-CLI aliases: `wp @local spck migrate`, `wp @production spck migrate`.

## Important notes

- **Order matters**: when doing multiple search-replace operations, put the most specific (longest) patterns first to avoid partial matches (e.g. `text-link` before `text`).
- **Idempotent by design**: each migration runs only once, tracked by filename in the database.
- **Automatic backup**: `provision.sh` exports the database before running pending migrations. The backup is saved as `db-backup-YYYYMMDD_HHMMSS.sql` in `$BACKUP_PATH` (default `$WORDPRESS_PATH/db-backups`), and only the newest `$BACKUP_KEEP` dumps are kept (default 10).
- **Failures are retried**: a migration that fails is recorded with `status: failed` and counts as pending again, so the next deployment re-runs it once the cause is fixed. Write migrations so a partial run can be repeated safely.
- **Failures are fatal**: if a migration fails, the deployment step exits non-zero and the workflow goes red. Nothing is restored automatically — the error output prints the `wp db import` command for the backup taken just before the run. See [`docs/setup/deployment.md`](../../../docs/setup/deployment.md) for the full deployment behaviour, including the nginx rule needed to keep the dumps unreachable.
