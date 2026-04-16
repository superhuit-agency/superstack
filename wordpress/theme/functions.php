<?php
/**
 * Superstack functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package Superstack
 */

/**
 * Current theme path.
 * Current theme url.
 * Current theme version.
 * Current theme name.
 * Current theme option name.
 */
$theme = wp_get_theme();

define('SUPERSTACK_PATH', trailingslashit(get_stylesheet_directory()));
define('SUPERSTACK_URL', trailingslashit(get_stylesheet_directory_uri()));
define('SUPERSTACK_VERSION', '1.0.0');
define('SUPERSTACK_THEME_NAME', $theme['Name']);
define('SUPERSTACK_OPTION_NAME', $theme['Version']);

add_post_type_support( 'page', 'excerpt' );

require_once SUPERSTACK_PATH . '/lib/_loader.php';

/**
 * The core theme class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require SUPERSTACK_PATH . 'includes/_loader.php';
