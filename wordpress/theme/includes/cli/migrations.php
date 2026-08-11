<?php

namespace Superstack\CLI;

if (! defined('ABSPATH')) {
	exit;
}

if (! defined('WP_CLI') || ! WP_CLI) {
	return;
}

/**
 * WP-CLI command to run database migrations.
 *
 * Migrations are stored as PHP files in the theme's `migrations/` directory.
 * Each file must return either an array of WP-CLI commands (without the `wp`
 * prefix) or a callable, which is executed with the whole of WordPress loaded.
 * Completed migrations are tracked in the `spck_completed_migrations` option.
 *
 * ## EXAMPLES
 *
 *     # Run all pending migrations
 *     wp spck migrate
 *
 *     # Preview pending migrations without executing
 *     wp spck migrate --dry-run
 *
 *     # Show migration status
 *     wp spck migrate --status
 *
 *     # Run one migration, whether or not it already ran
 *     wp spck migrate --only=20260101_120000_fix_cards.php
 *
 *     # Record every pending migration as done without executing it
 *     wp spck migrate --mark-complete
 *
 * @package    Superstack
 * @subpackage Superstack/CLI
 * @since      1.0.0
 */
class Migrations {

	const OPTION_NAME = 'spck_completed_migrations';

	/**
	 * Register the WP-CLI command.
	 *
	 * @access public
	 * @return void
	 */
	public static function register() {
		\WP_CLI::add_command('spck migrate', [self::class, 'run'], [
			'shortdesc' => 'Run pending database migrations.',
			'synopsis'  => [
				[
					'type'        => 'flag',
					'name'        => 'dry-run',
					'description' => 'Preview pending migrations without executing them.',
					'optional'    => true,
				],
				[
					'type'        => 'flag',
					'name'        => 'status',
					'description' => 'Show migration status (pending and completed).',
					'optional'    => true,
				],
				[
					'type'        => 'flag',
					'name'        => 'pending-count',
					'description' => 'Output only the number of pending migrations (for scripting).',
					'optional'    => true,
				],
				[
					'type'        => 'assoc',
					'name'        => 'only',
					'description' => 'Run a single migration by filename, ignoring whether it already ran.',
					'optional'    => true,
				],
				[
					'type'        => 'flag',
					'name'        => 'mark-complete',
					'description' => 'Record migrations as completed without executing them (baselining).',
					'optional'    => true,
				],
			],
		]);
	}

	/**
	 * Run pending database migrations.
	 *
	 * @access public
	 *
	 * @param array $args       Positional arguments.
	 * @param array $assoc_args Associative arguments (flags).
	 * @return void
	 */
	public static function run($args, $assoc_args) {
		$dry_run       = \WP_CLI\Utils\get_flag_value($assoc_args, 'dry-run', false);
		$status        = \WP_CLI\Utils\get_flag_value($assoc_args, 'status', false);
		$pending_count = \WP_CLI\Utils\get_flag_value($assoc_args, 'pending-count', false);
		$only          = \WP_CLI\Utils\get_flag_value($assoc_args, 'only', null);
		$mark_complete = \WP_CLI\Utils\get_flag_value($assoc_args, 'mark-complete', false);

		$completed      = self::get_completed();
		$migrations_dir = SUPERSTACK_PATH . 'migrations/';

		if (! is_dir($migrations_dir)) {
			if ($pending_count) {
				\WP_CLI::log('0');
				return;
			}
			\WP_CLI::warning('No migrations directory found.');
			return;
		}

		$files = glob($migrations_dir . '*.php');
		sort($files);

		if ($status) {
			self::show_status($files, $completed);
			return;
		}

		$pending = [];
		foreach ($files as $file) {
			if (self::is_pending(basename($file), $completed)) {
				$pending[] = $file;
			}
		}

		if ($pending_count) {
			\WP_CLI::log((string) count($pending));
			return;
		}

		// `--only` addresses one migration by name, whatever its recorded state.
		if ($only) {
			$pending = [self::resolve_only($only, $files, $migrations_dir)];
		}

		if (empty($pending)) {
			\WP_CLI::success('No pending migrations.');
			return;
		}

		if ($mark_complete) {
			self::mark_complete($pending, $completed, $dry_run);
			return;
		}

		\WP_CLI::log(sprintf('%d pending migration(s).', count($pending)));
		\WP_CLI::log('');

		foreach ($pending as $file) {
			$name = basename($file);

			if ($dry_run) {
				\WP_CLI::log("[dry-run] Would run: $name");
				continue;
			}

			\WP_CLI::log("Running: $name");

			$started   = microtime(true);
			$migration = require $file;

			if (! is_array($migration) && ! is_callable($migration)) {
				\WP_CLI::warning("Migration $name did not return an array or a callable. Skipping.");
				continue;
			}

			try {
				self::execute($migration);
			} catch (\Throwable $error) {
				// Record the failure before bailing: the entry is still counted
				// as pending, so the next run retries this migration.
				$completed[$name] = [
					'ran_at'   => gmdate('Y-m-d H:i:s'),
					'duration' => round(microtime(true) - $started, 3),
					'status'   => 'failed',
				];
				self::save_completed($completed);

				\WP_CLI::error("Failed: $name — " . $error->getMessage());
			}

			$completed[$name] = [
				'ran_at'   => gmdate('Y-m-d H:i:s'),
				'duration' => round(microtime(true) - $started, 3),
				'status'   => 'completed',
			];
			self::save_completed($completed);

			\WP_CLI::success("Completed: $name");
		}

		if (! $dry_run) {
			\WP_CLI::log('');
			\WP_CLI::success('All migrations completed.');
		}
	}

	/**
	 * Execute a migration's payload.
	 *
	 * A migration returns either a list of WP-CLI command strings (the original
	 * contract) or a callable, which runs with WordPress fully loaded — use that
	 * form whenever the migration needs `$wpdb->prefix`, `WP_Query`, or anything
	 * else that does not survive being squeezed into a shell string.
	 *
	 * @access private
	 *
	 * @param array|callable $migration Value returned by the migration file.
	 * @throws \RuntimeException When a WP-CLI command exits non-zero.
	 * @return void
	 */
	private static function execute($migration) {
		if (! is_array($migration)) {
			call_user_func($migration);
			return;
		}

		foreach ($migration as $command) {
			\WP_CLI::log("  > wp $command");

			// `exit_error` would halt the process before the failure could be
			// recorded, so inspect the return code and throw instead.
			$result = \WP_CLI::runcommand($command, [
				'return'     => 'all',
				'exit_error' => false,
			]);

			$stdout = isset($result->stdout) ? rtrim($result->stdout) : '';
			if ('' !== $stdout) {
				\WP_CLI::log($stdout);
			}

			if (0 !== $result->return_code) {
				$stderr = isset($result->stderr) ? trim($result->stderr) : '';
				throw new \RuntimeException(sprintf(
					'`wp %s` exited with %d%s',
					$command,
					$result->return_code,
					'' !== $stderr ? ': ' . $stderr : ''
				));
			}
		}
	}

	/**
	 * Resolve the `--only` value to a known migration file path.
	 *
	 * Only the basename is honoured, so the flag cannot be pointed at a PHP file
	 * outside the migrations directory.
	 *
	 * @access private
	 *
	 * @param string $only           Filename passed to `--only`.
	 * @param array  $files          All migration file paths.
	 * @param string $migrations_dir Absolute path to the migrations directory.
	 * @return string Absolute path to the migration file.
	 */
	private static function resolve_only($only, $files, $migrations_dir) {
		$file = $migrations_dir . basename($only);

		if (! in_array($file, $files, true)) {
			\WP_CLI::error(sprintf('Migration "%s" not found in %s', basename($only), $migrations_dir));
		}

		return $file;
	}

	/**
	 * Record migrations as completed without executing them.
	 *
	 * Used to baseline a fresh install, where the database is created by the
	 * current version of the theme and every existing migration is a no-op.
	 *
	 * @access private
	 *
	 * @param array $files     Migration file paths to mark.
	 * @param array $completed Completed migrations, keyed by filename.
	 * @param bool  $dry_run   Whether to preview instead of recording.
	 * @return void
	 */
	private static function mark_complete($files, $completed, $dry_run) {
		foreach ($files as $file) {
			$name = basename($file);

			if ($dry_run) {
				\WP_CLI::log("[dry-run] Would mark as completed: $name");
				continue;
			}

			// No duration: nothing was executed.
			$completed[$name] = [
				'ran_at'   => gmdate('Y-m-d H:i:s'),
				'duration' => null,
				'status'   => 'completed',
			];
			\WP_CLI::log("Marked as completed without running: $name");
		}

		if ($dry_run) {
			return;
		}

		self::save_completed($completed);
		\WP_CLI::success(sprintf('%d migration(s) marked as completed.', count($files)));
	}

	/**
	 * Whether a migration still needs to run.
	 *
	 * A migration recorded as `failed` counts as pending so the next run retries
	 * it once the cause has been fixed.
	 *
	 * @access private
	 *
	 * @param string $name      Migration filename.
	 * @param array  $completed Completed migrations, keyed by filename.
	 * @return bool
	 */
	private static function is_pending($name, $completed) {
		return ! isset($completed[$name]) || 'completed' !== $completed[$name]['status'];
	}

	/**
	 * Read the completed migrations, normalised to the current storage format.
	 *
	 * Entries are keyed by filename and hold an audit trail:
	 * `[ 'ran_at' => 'Y-m-d H:i:s', 'duration' => float, 'status' => string ]`.
	 * Options written by earlier versions hold a flat list of filenames — those
	 * are shimmed to the same shape with an unknown run date and duration.
	 *
	 * @access private
	 * @return array Completed migrations, keyed by filename.
	 */
	private static function get_completed() {
		$stored = get_option(self::OPTION_NAME, []);

		if (! is_array($stored)) {
			return [];
		}

		$completed = [];
		foreach ($stored as $key => $value) {
			// Legacy flat format: a plain list of filenames.
			if (is_int($key)) {
				$completed[$value] = [
					'ran_at'   => null,
					'duration' => null,
					'status'   => 'completed',
				];
				continue;
			}

			$value           = is_array($value) ? $value : [];
			$completed[$key] = [
				'ran_at'   => isset($value['ran_at']) ? $value['ran_at'] : null,
				'duration' => isset($value['duration']) ? $value['duration'] : null,
				'status'   => isset($value['status']) ? $value['status'] : 'completed',
			];
		}

		return $completed;
	}

	/**
	 * Persist the completed migrations.
	 *
	 * @access private
	 *
	 * @param array $completed Completed migrations, keyed by filename.
	 * @return void
	 */
	private static function save_completed($completed) {
		update_option(self::OPTION_NAME, $completed, false);

		// `update_option()` does not reliably flip `autoload` on a row that
		// already exists, so set it explicitly (WP 6.6+).
		if (function_exists('wp_set_option_autoload')) {
			wp_set_option_autoload(self::OPTION_NAME, false);
		}
	}

	/**
	 * Display migration status.
	 *
	 * @access private
	 *
	 * @param array $files     All migration file paths.
	 * @param array $completed Completed migrations, keyed by filename.
	 * @return void
	 */
	private static function show_status($files, $completed) {
		if (empty($files)) {
			\WP_CLI::log('No migration files found.');
			return;
		}

		$items = [];
		foreach ($files as $file) {
			$name    = basename($file);
			$entry   = isset($completed[$name]) ? $completed[$name] : null;
			$items[] = [
				'migration' => $name,
				'status'    => $entry ? $entry['status'] : 'pending',
				'ran_at'    => $entry && $entry['ran_at'] ? $entry['ran_at'] : '-',
				'duration'  => $entry && null !== $entry['duration'] ? $entry['duration'] . 's' : '-',
			];
		}

		\WP_CLI\Utils\format_items('table', $items, ['migration', 'status', 'ran_at', 'duration']);
	}
}

Migrations::register();
