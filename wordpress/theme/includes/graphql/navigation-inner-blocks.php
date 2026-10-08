<?php

namespace Superstack\GraphQL\NavigationInnerBlocks;

add_filter('register_post_type_args', __NAMESPACE__ . '\\expose_wp_navigation_to_graphql', 10, 2);
add_action('graphql_register_types', __NAMESPACE__ . '\\register_navigation_menu_blocks_json_field');

/**
 * Expose the `wp_navigation` post type in the WPGraphQL schema as `NavigationMenu`,
 * so Next.js can fetch navigation children at request time via a standard query
 * instead of relying on a custom root field or a build-time snapshot.
 */
function expose_wp_navigation_to_graphql($args, $post_type) {
	if ('wp_navigation' === $post_type) {
		$args['public']              = true;
		$args['publicly_queryable']  = true;
		$args['show_in_graphql']     = true;
		$args['graphql_single_name'] = 'NavigationMenu';
		$args['graphql_plural_name'] = 'NavigationMenus';
	}
	return $args;
}

/**
 * Register a `blocksJSON` field on `NavigationMenu` that returns the parsed
 * blocks of the `wp_navigation` post as a normalized JSON string.
 */
function register_navigation_menu_blocks_json_field(): void {
	register_graphql_field('NavigationMenu', 'blocksJSON', [
		'type'        => 'String',
		'description' => 'Parsed blocks of the wp_navigation post, as a JSON string.',
		'resolve'     => function ($source): ?string {
			$id      = $source->databaseId ?? $source->ID ?? 0;
			$content = $id > 0 ? get_post_field('post_content', $id) : '';

			if (empty($content)) {
				return wp_json_encode([]);
			}

			$blocks = parse_blocks($content);
			$blocks = filter_out_empty_blocks_recursive(is_array($blocks) ? $blocks : []);
			$blocks = resolve_bound_urls($blocks);
			$blocks = normalize_blocks_for_graphql_shape($blocks);

			return wp_json_encode($blocks);
		},
	]);
}

/**
 * Normalize parsed blocks to the GraphQL blocksJSON shape expected by the
 * Next.js frontend: { name, attributes, innerBlocks }.
 */
function normalize_blocks_for_graphql_shape(array $blocks): array {
	foreach ($blocks as $index => $block) {
		if (! is_array($block)) {
			continue;
		}

		$blocks[$index]['name']       = $block['name'] ?? $block['blockName'] ?? '';
		$blocks[$index]['attributes'] = $block['attributes'] ?? $block['attrs'] ?? [];

		if (! empty($block['innerBlocks']) && is_array($block['innerBlocks'])) {
			$blocks[$index]['innerBlocks'] = normalize_blocks_for_graphql_shape($block['innerBlocks']);
		} else {
			$blocks[$index]['innerBlocks'] = [];
		}
	}

	return $blocks;
}

/**
 * Replace the stored `url` of blocks whose `url` is bound (e.g. a link to a
 * page, bound to its `core/post-data` link) with the bound value, as WordPress
 * does when it renders them, so a link follows the page when it moves.
 */
function resolve_bound_urls(array $blocks): array {
	foreach ($blocks as $index => $block) {
		$binding = $block['attrs']['metadata']['bindings']['url'] ?? null;
		$source  = is_array($binding) && is_string($binding['source'] ?? null) && function_exists('get_block_bindings_source')
			? get_block_bindings_source($binding['source'])
			: null;

		if ($source) {
			$url = $source->get_value((array) ($binding['args'] ?? []), new \WP_Block($block), 'url');

			if (is_string($url) && '' !== $url) {
				$blocks[$index]['attrs']['url'] = relative_if_internal(html_entity_decode($url, ENT_QUOTES));
			}
		}

		$blocks[$index]['innerBlocks'] = resolve_bound_urls($block['innerBlocks']);
	}

	return $blocks;
}

/**
 * Make a URL of this site relative, as the front end links to it.
 */
function relative_if_internal(string $url): string {
	return wp_parse_url($url, PHP_URL_HOST) === wp_parse_url(home_url(), PHP_URL_HOST)
		? wp_make_link_relative($url)
		: $url;
}

/**
 * Remove parser artifacts (null block name entries) recursively.
 */
function filter_out_empty_blocks_recursive(array $blocks): array {
	$filtered = [];

	foreach ($blocks as $block) {
		if (! is_array($block)) {
			continue;
		}

		$block_name = $block['name'] ?? $block['blockName'] ?? '';
		if (empty($block_name)) {
			continue;
		}

		if (! empty($block['innerBlocks']) && is_array($block['innerBlocks'])) {
			$block['innerBlocks'] = filter_out_empty_blocks_recursive($block['innerBlocks']);
		} else {
			$block['innerBlocks'] = [];
		}

		$filtered[] = $block;
	}

	return array_values($filtered);
}
