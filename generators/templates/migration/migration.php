<?php

/**
 * Migration: {{description}}
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

// Keep one of the two forms below and delete the other.

// Either an array of WP-CLI commands, without the `wp` prefix…
return [
	'search-replace "old-value" "new-value" --report-changed-only',
];

// …or a callable, which runs with WordPress fully loaded. Prefer this form as
// soon as the migration needs the table prefix — hardcoding `wp_` in a
// `db query` silently does nothing on a site with a different prefix — or as
// soon as the command string needs escaping gymnastics.
//
// return function () {
// 	global $wpdb;
//
// 	$wpdb->query(
// 		"UPDATE {$wpdb->posts} SET post_content = REPLACE(post_content, 'old-value', 'new-value')"
// 	);
// };
