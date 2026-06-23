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
