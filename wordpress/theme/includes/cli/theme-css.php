<?php

namespace Superstack\CLI;

if (! defined('ABSPATH')) {
	exit;
}

if (! defined('WP_CLI') || ! WP_CLI) {
	return;
}

/**
 * WP-CLI command to generate theme CSS variables output.
 *
 * ## EXAMPLES
 *
 *     # Output CSS variables for active theme
 *     wp spck theme-css
 *
 * @package    Superstack
 * @subpackage Superstack/CLI
 * @since      1.0.0
 */
class Theme_Css {

	/**
	 * Register the WP-CLI command.
	 *
	 * @access public
	 * @return void
	 */
	public static function register() {
		\WP_CLI::add_command('spck theme-css', [self::class, 'run'], [
			'shortdesc' => 'Output theme CSS variables from wp_get_global_stylesheet.',
		]);
	}

	/**
	 * Output CSS variables for the current theme.
	 *
	 * @access public
	 * @return void
	 */
	public static function run() {
		$raw_css = wp_get_global_stylesheet(['variables']);

		$root_position = strpos($raw_css, ':root{');
		if ($root_position !== false) {
			$raw_css = substr($raw_css, $root_position);
		}

		echo $raw_css;
	}
}

Theme_Css::register();
