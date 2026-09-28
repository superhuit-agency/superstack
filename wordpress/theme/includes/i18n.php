<?php

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Load the theme translations.
 *
 * Must run before `init`, when post types and taxonomies register their
 * translated labels.
 *
 * @package Superstack
 * @since 1.0.0
 */
add_action('after_setup_theme', function () {
	load_theme_textdomain('superstack', SUPERSTACK_PATH . 'languages');
});
