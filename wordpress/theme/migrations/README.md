# Database Migrations

Migration scripts apply one-time database changes required by theme updates (e.g. renaming CSS classes stored in block markup).

## How it works

- Migrations are PHP files in this directory, each returning an array of WP-CLI commands (without the `wp` prefix).
- A custom WP-CLI command (`wp spck migrate`) runs pending migrations in chronological order.
- Completed migrations are tracked in the `spck_completed_migrations` wp_option — each migration runs only once.
- During deployment, `provision.sh` checks for pending migrations, creates a DB backup if any exist, then runs them.

## Creating a migration

1. Create a new PHP file with the naming convention:

    ```
    YYYYMMDD_HHMMSS_short_description.php
    ```

    The timestamp prefix ensures migrations run in the correct order.

2. The file must return an array of WP-CLI commands (without `wp` prefix):

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

3. Commit the migration file alongside the theme changes that require it.

## CLI usage

| Command                           | Description                                         |
| --------------------------------- | --------------------------------------------------- |
| `wp spck migrate`                 | Run all pending migrations                          |
| `wp spck migrate --dry-run`       | Preview pending migrations without executing        |
| `wp spck migrate --status`        | Show table of all migrations and their state        |
| `wp spck migrate --pending-count` | Output number of pending migrations (for scripting) |

Works with WP-CLI aliases: `wp @local spck migrate`, `wp @production spck migrate`.

## Important notes

- **Order matters**: when doing multiple search-replace operations, put the most specific (longest) patterns first to avoid partial matches (e.g. `text-link` before `text`).
- **Idempotent by design**: each migration runs only once, tracked by filename in the database.
- **Automatic backup**: `provision.sh` exports the database before running pending migrations. The backup is saved as `db-backup-YYYYMMDD_HHMMSS.sql` in `$BACKUP_PATH` (default `$WORDPRESS_PATH/db-backups`), and only the newest `$BACKUP_KEEP` dumps are kept (default 10).
- **Failures are fatal**: if a migration fails, the deployment step exits non-zero and the workflow goes red. Nothing is restored automatically — the error output prints the `wp db import` command for the backup taken just before the run. See [`docs/setup/deployment.md`](../../../docs/setup/deployment.md) for the full deployment behaviour, including the nginx rule needed to keep the dumps unreachable.
