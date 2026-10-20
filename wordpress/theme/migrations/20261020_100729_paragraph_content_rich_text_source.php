<?php

/**
 * Migration: paragraph content rich text source
 *
 * Switches `core/paragraph`'s `content` attribute source from `html` to
 * `rich-text` in the wp-graphql-gutenberg block registry
 * (`wp_graphql_gutenberg_block_types`). `provision.sh` used to seed that
 * registry with a pre-WP 6.5 paragraph schema whose `html` source makes
 * `blocksJSON` return the content with its `<p>` wrapper, which the Next.js
 * `Paragraph` component then nests inside its own `<p>` (React hydration
 * error #418 on every page). Every other block and attribute is left as is,
 * and a registry that is missing or already uses `rich-text` is not touched.
 *
 * Related commit: the provision.sh seed fix it ships with (issue #246)
 *
 * @package Superstack
 * @since   1.0.0
 */

if (! defined('ABSPATH')) {
	exit;
}

return function () {
	$option   = 'wp_graphql_gutenberg_block_types';
	$registry = get_option($option);

	if (! is_array($registry)) {
		return;
	}

	$source = $registry['core/paragraph']['attributes']['content']['source'] ?? null;

	if ($source !== 'html') {
		return;
	}

	$registry['core/paragraph']['attributes']['content']['source'] = 'rich-text';

	update_option($option, $registry, false);
};
