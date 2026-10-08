<?php

namespace Superstack\Admin\NextjsRevalidate;

add_filter('nextjs_revalidate_should_revalidate_post', __NAMESPACE__ . '\skip_theme_post_types', 10, 2);
add_filter('nextjs_revalidate_site_setting_options', __NAMESPACE__ . '\add_reading_settings');

/**
 * Don't report a block menu (`wp_navigation`), a template (`wp_template`) or a
 * template part (`wp_template_part`) as a `post` change.
 *
 * The theme makes these types public to expose them to WPGraphQL
 * (see `graphql/navigation-inner-blocks.php` and
 * `graphql/register-fse-templates.php`), so the plugin would also report each
 * save as a post, clearing every listing. The plugin already reports a menu
 * as a `menu` change, and a template or a template part as a `templates`
 * change.
 *
 * @param bool $should_revalidate Whether the post is revalidated.
 * @param int  $post_id           The post ID.
 * @return bool
 */
function skip_theme_post_types($should_revalidate, $post_id) {
	if (in_array(get_post_type($post_id), ['wp_navigation', 'wp_template', 'wp_template_part'], true)) {
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
