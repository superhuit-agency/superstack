<?php
if (! defined('ABSPATH')) {
	define('WP_USE_THEMES', false);
	$_SERVER['HTTP_HOST'] = $_SERVER['HTTP_HOST'] ?? 'localhost';
	$_SERVER['REQUEST_METHOD'] = $_SERVER['REQUEST_METHOD'] ?? 'GET';
	$_SERVER['REQUEST_URI'] = $_SERVER['REQUEST_URI'] ?? '/';
	$candidate_wp_load_paths = array_filter([
		getenv('WP_LOAD_PATH') ?: null,
		'/var/www/html/wp-load.php',
		dirname(__DIR__, 3) . '/wp-load.php',
	]);
	$wp_load_path = null;
	foreach ($candidate_wp_load_paths as $candidate_wp_load_path) {
		if (file_exists($candidate_wp_load_path)) {
			$wp_load_path = $candidate_wp_load_path;
			break;
		}
	}
	if (! $wp_load_path) {
		fwrite(STDERR, "Could not find wp-load.php. Set WP_LOAD_PATH env var.\n");
		exit(1);
	}
	require_once $wp_load_path;
}

$theme_slug = getenv('THEME_SLUG') ?: 'superstack';
if (function_exists('is_blog_installed') && ! is_blog_installed()) {
	fwrite(STDERR, "WordPress is not installed. Run project provisioning first.\n");
	exit(1);
}

$theme = wp_get_theme($theme_slug);
if (! $theme->exists()) {
	fwrite(STDERR, "Theme not found for slug: {$theme_slug}\n");
	exit(1);
}

switch_theme($theme->get_stylesheet());
$css = wp_get_global_stylesheet(['variables', 'styles', 'presets']);
$output_dir = dirname(__DIR__) . '/public/styles';
$output_file = $output_dir . '/theme-generated.css';
if (! is_dir($output_dir)) {
	mkdir($output_dir, 0755, true);
}

file_put_contents($output_file, $css);
echo 'Full theme CSS generated (' . round(strlen($css) / 1024, 1) . " KB)\n";
echo "Saved to: {$output_file}\n";
