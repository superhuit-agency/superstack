<?php

namespace Superstack\GraphQL\NavigationInnerBlocks;

add_filter('graphql_resolve_field', __NAMESPACE__ . '\\populate_navigation_inner_blocks', 20, 9);

/**
 * Populate core/navigation innerBlocks for blocksJSON GraphQL field.
 *
 * This mirrors WordPress server rendering behavior where a navigation block
 * with `attrs.ref` pulls its items from the referenced wp_navigation post.
 *
 * @param mixed  $result Field resolution result.
 * @param mixed  $source Field source.
 * @param array  $args Field args.
 * @param mixed  $context GraphQL context.
 * @param mixed  $info GraphQL resolve info.
 * @param string $type_name GraphQL parent type name.
 * @param string $field_key Field key.
 * @param mixed  $field Field definition.
 * @param mixed  $field_resolver Default field resolver.
 *
 * @return mixed
 */
function populate_navigation_inner_blocks($result, $source, $args, $context, $info, $type_name, $field_key, $field, $field_resolver) {
	if ('blocksJSON' !== $field_key || empty($result) || ! is_string($result)) {
		return $result;
	}

	$blocks = json_decode($result, true);
	if (! is_array($blocks)) {
		return $result;
	}

	$navigation_refs = get_navigation_refs_from_source_content($source);
	$cache          = array();
	$updated_blocks = populate_navigation_blocks_deep($blocks, $cache, $navigation_refs);

	return wp_json_encode($updated_blocks);
}

/**
 * Recursively populate core/navigation blocks in a parsed blocks tree.
 *
 * @param array $blocks Parsed blocks list.
 * @param array $cache  Per-request cache for navigation ref => parsed blocks.
 *
 * @return array
 */
function populate_navigation_blocks_deep(array $blocks, array &$cache, array &$navigation_refs = array()): array {
	foreach ($blocks as $index => $block) {
		if (! is_array($block)) {
			continue;
		}

		$blocks[$index] = populate_navigation_block($block, $cache, $navigation_refs);
	}

	return $blocks;
}

/**
 * Populate one core/navigation block from its referenced wp_navigation post.
 *
 * @param array $block Parsed block.
 * @param array $cache Per-request cache for navigation ref => parsed blocks.
 *
 * @return array
 */
function populate_navigation_block(array $block, array &$cache, array &$navigation_refs = array()): array {
	$block_name = $block['name'] ?? $block['blockName'] ?? '';

	if ('core/navigation' === $block_name) {
		$ref = absint($block['attrs']['ref'] ?? $block['attributes']['ref'] ?? 0);
		if ($ref <= 0 && ! empty($navigation_refs)) {
			$ref = absint(array_shift($navigation_refs));
		}

		if ($ref > 0) {
			if (! array_key_exists($ref, $cache)) {
				$cache[$ref] = array();
				$navigation_post = get_post($ref);

				if ($navigation_post && 'publish' === $navigation_post->post_status) {
					$parsed_blocks = ! empty($navigation_post->post_content)
						? parse_blocks($navigation_post->post_content)
						: array();
					$parsed_blocks = filter_out_empty_blocks_recursive(is_array($parsed_blocks) ? $parsed_blocks : array());

					$cache[$ref] = is_array($parsed_blocks)
						? normalize_blocks_for_graphql_shape($parsed_blocks)
						: array();
				}
			}

			if (! empty($cache[$ref])) {
				$block['innerBlocks'] = $cache[$ref];
			}
		}
	}

	if (! empty($block['innerBlocks']) && is_array($block['innerBlocks'])) {
		$block['innerBlocks'] = populate_navigation_blocks_deep($block['innerBlocks'], $cache, $navigation_refs);
	}

	return $block;
}

/**
 * Get navigation refs from the source post content in traversal order.
 *
 * @param mixed $source GraphQL source object.
 *
 * @return array<int>
 */
function get_navigation_refs_from_source_content($source): array {
	$post_id = 0;
	if (is_object($source)) {
		if (isset($source->databaseId)) {
			$post_id = absint($source->databaseId);
		} elseif (isset($source->ID)) {
			$post_id = absint($source->ID);
		} elseif (method_exists($source, 'get_database_id')) {
			$post_id = absint($source->get_database_id());
		}
	}

	if ($post_id <= 0) {
		return array();
	}

	$post = get_post($post_id);
	if (! $post || empty($post->post_content)) {
		return array();
	}

	$parsed_blocks = parse_blocks($post->post_content);
	if (! is_array($parsed_blocks)) {
		return array();
	}
	$parsed_blocks = filter_out_empty_blocks_recursive($parsed_blocks);

	$refs = array();
	collect_navigation_refs($parsed_blocks, $refs);
	return $refs;
}

/**
 * Recursively collect core/navigation refs in traversal order.
 *
 * @param array          $blocks Parsed blocks.
 * @param array<int,mixed> $refs   Collected refs.
 */
function collect_navigation_refs(array $blocks, array &$refs): void {
	foreach ($blocks as $block) {
		if (! is_array($block)) {
			continue;
		}

		if ('core/navigation' === ($block['blockName'] ?? '')) {
			$ref = absint($block['attrs']['ref'] ?? 0);
			if ($ref > 0) {
				$refs[] = $ref;
			}
		}

		if (! empty($block['innerBlocks']) && is_array($block['innerBlocks'])) {
			collect_navigation_refs($block['innerBlocks'], $refs);
		}
	}
}

/**
 * Normalize parsed blocks to GraphQL blocksJSON shape.
 *
 * Ensures compatibility with frontend parser expecting:
 * - name
 * - attributes
 * - innerBlocks
 *
 * @param array $blocks Parsed blocks from parse_blocks().
 *
 * @return array
 */
function normalize_blocks_for_graphql_shape(array $blocks): array {
	foreach ($blocks as $index => $block) {
		if (! is_array($block)) {
			continue;
		}

		$blocks[$index]['name']       = $block['name'] ?? $block['blockName'] ?? '';
		$blocks[$index]['attributes'] = $block['attributes'] ?? $block['attrs'] ?? array();

		if (! empty($block['innerBlocks']) && is_array($block['innerBlocks'])) {
			$blocks[$index]['innerBlocks'] = normalize_blocks_for_graphql_shape($block['innerBlocks']);
		} else {
			$blocks[$index]['innerBlocks'] = array();
		}
	}

	return $blocks;
}

/**
 * Remove parser artifacts (null block name entries) recursively.
 *
 * @param array $blocks Parsed blocks.
 *
 * @return array
 */
function filter_out_empty_blocks_recursive(array $blocks): array {
	$filtered = array();

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
			$block['innerBlocks'] = array();
		}

		$filtered[] = $block;
	}

	return array_values($filtered);
}
