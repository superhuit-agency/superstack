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
 * Each file must return an array of WP-CLI commands (without the `wp` prefix).
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

		$completed      = get_option(self::OPTION_NAME, []);
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
			$name = basename($file);
			if (! in_array($name, $completed, true)) {
				$pending[] = $file;
			}
		}

		if ($pending_count) {
			\WP_CLI::log((string) count($pending));
			return;
		}

		if (empty($pending)) {
			\WP_CLI::success('No pending migrations.');
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

			$commands = require $file;

			if (! is_array($commands)) {
				\WP_CLI::warning("Migration $name did not return an array. Skipping.");
				continue;
			}

			foreach ($commands as $command) {
				\WP_CLI::log("  > wp $command");
				\WP_CLI::runcommand($command, [
					'return'     => false,
					'exit_error' => true,
				]);
			}

			$completed[] = $name;
			update_option(self::OPTION_NAME, $completed);

			\WP_CLI::success("Completed: $name");
		}

		if (! $dry_run) {
			\WP_CLI::log('');
			\WP_CLI::success('All migrations completed.');
		}
	}

	/**
	 * Display migration status.
	 *
	 * @access private
	 *
	 * @param array $files     All migration file paths.
	 * @param array $completed List of completed migration filenames.
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
			$items[] = [
				'migration' => $name,
				'status'    => in_array($name, $completed, true) ? 'completed' : 'pending',
			];
		}

		\WP_CLI\Utils\format_items('table', $items, ['migration', 'status']);
	}
}

Migrations::register();
