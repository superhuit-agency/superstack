<?php

namespace Superstack\Admin\NextjsRevalidate;

add_filter('nextjs_revalidate_should_revalidate_post', __NAMESPACE__ . '\skip_block_menus', 10, 2);
add_filter('nextjs_revalidate_site_setting_options', __NAMESPACE__ . '\add_reading_settings');

/**
 * Don't report a block menu (`wp_navigation`) as a `post` change.
 *
 * The theme makes `wp_navigation` public to expose it to WPGraphQL
 * (see `graphql/navigation-inner-blocks.php`), so the plugin would also
 * report each menu save as a post, clearing every listing. The plugin
 * already reports it as a `menu` change.
 *
 * @param bool $should_revalidate Whether the post is revalidated.
 * @param int  $post_id           The post ID.
 * @return bool
 */
function skip_block_menus($should_revalidate, $post_id) {
	if ('wp_navigation' === get_post_type($post_id)) {
		return false;
	}

	return $should_revalidate;
}

/**
 * Report Settings › Reading's front page and posts page as a `settings`
 * change: every public node read that finds a node carries the `settings`
 * tag, a cached 404 doesn't. A stopgap the plugin's ADR 0037 rules out,
 * until nextjs-revalidate#172 (see docs/caching.md › Options that move URIs).
 *
 * @param string[] $options The site setting options.
 * @return string[]
 */
function add_reading_settings($options) {
	if (! is_array($options)) {
		return $options;
	}

	return array_merge($options, ['show_on_front', 'page_on_front', 'page_for_posts']);
}
