<?php

/**
 * Rewrite core/query block offsets in blocksJSON using X-Query-Page header.
 *
 * This keeps pagination logic server-side: Next can render /page/{n} and send
 * X-Query-Page: n, and WPGraphQL returns blocksJSON where core/query already
 * contains the correct query.offset.
 */

namespace Superstack\GraphQL\QueryPaginationOffset;

add_filter('graphql_resolve_field', __NAMESPACE__ . '\\rewrite_query_offsets', 20, 9);

/**
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
function rewrite_query_offsets($result, $source, $args, $context, $info, $type_name, $field_key, $field, $field_resolver) {
	if ('blocksJSON' !== $field_key || empty($result) || ! is_string($result)) {
		return $result;
	}

	$page_header = isset($_SERVER['HTTP_X_QUERY_PAGE']) ? (int) $_SERVER['HTTP_X_QUERY_PAGE'] : 1;
	$page        = $page_header > 0 ? $page_header : 1;

	$blocks = json_decode($result, true);
	if (! is_array($blocks)) {
		return $result;
	}

	$base_uri = get_source_uri($source);
	$blocks   = rewrite_blocks_deep($blocks, $page, $base_uri, null);
	return wp_json_encode($blocks);
}

/**
 * Recursively rewrite core/query blocks inside a parsed blocks tree.
 *
 * @param array $blocks Parsed blocksJSON array.
 * @param int         $page      Current page number (>= 1).
 * @param string|null $base_uri  Source node uri (e.g. "/blog/").
 * @param int|null    $max_pages Optional max pages from surrounding core/query attributes.
 *
 * @return array
 */
function rewrite_blocks_deep(array $blocks, int $page, ?string $base_uri, ?int $max_pages): array {
	foreach ($blocks as $i => $block) {
		if (! is_array($block)) {
			continue;
		}

		$name       = $block['name'] ?? $block['blockName'] ?? '';
		$attributes = $block['attributes'] ?? $block['attrs'] ?? array();

		if ('core/query' === $name && is_array($attributes)) {
			$attributes['query'] = isset($attributes['query']) && is_array($attributes['query'])
				? $attributes['query']
				: array();

			$per_page = isset($attributes['query']['perPage']) ? (int) $attributes['query']['perPage'] : 0;
			$per_page = $per_page > 0 ? $per_page : 10;

			$attributes['query']['offset'] = ($page - 1) * $per_page;

			// Best-effort max pages (Gutenberg stores it under query.pages).
			$max_pages = isset($attributes['query']['pages']) ? (int) $attributes['query']['pages'] : $max_pages;
			$max_pages = $max_pages && $max_pages > 0 ? $max_pages : null;

			if (array_key_exists('attributes', $block)) {
				$block['attributes'] = $attributes;
			} else {
				$block['attrs'] = $attributes;
			}
			$blocks[$i] = $block;
		}

		if ('core/query-pagination-next' === $name || 'core/query-pagination-previous' === $name) {
			$blocks[$i] = rewrite_pagination_block($block, $page, $base_uri, $max_pages);
		}

		if (! empty($block['innerBlocks']) && is_array($block['innerBlocks'])) {
			$block['innerBlocks'] = rewrite_blocks_deep($block['innerBlocks'], $page, $base_uri, $max_pages);
			$blocks[$i]         = $block;
		}
	}

	return $blocks;
}

/**
 * Get source uri from WPGraphQL source object if present.
 *
 * @param mixed $source GraphQL source.
 *
 * @return string|null
 */
function get_source_uri($source): ?string {
	if (is_object($source)) {
		if (isset($source->uri) && is_string($source->uri) && '' !== $source->uri) {
			return $source->uri;
		}
		if (method_exists($source, 'get_uri')) {
			$uri = $source->get_uri();
			return is_string($uri) && '' !== $uri ? $uri : null;
		}
	}
	return null;
}

/**
 * Inject href/label/isDisabled into pagination blocks so the frontend doesn't need context threading.
 *
 * @param array       $block     Parsed block.
 * @param int         $page      Current page number.
 * @param string|null $base_uri  Base uri (e.g. "/blog/").
 * @param int|null    $max_pages Optional max pages.
 *
 * @return array
 */
function rewrite_pagination_block(array $block, int $page, ?string $base_uri, ?int $max_pages): array {
	$name = $block['name'] ?? $block['blockName'] ?? '';

	$attrs_key  = array_key_exists('attributes', $block) ? 'attributes' : 'attrs';
	$attributes = isset($block[$attrs_key]) && is_array($block[$attrs_key]) ? $block[$attrs_key] : array();

	$base_uri = is_string($base_uri) && '' !== $base_uri ? $base_uri : '/';
	$base_uri = '/' . ltrim($base_uri, '/');

	$default_label = ('core/query-pagination-next' === $name) ? 'Next Page' : 'Previous Page';
	$label         = isset($attributes['label']) && is_string($attributes['label']) && '' !== trim($attributes['label'])
		? trim($attributes['label'])
		: $default_label;

	$href       = null;
	$is_enabled = false;

	if ('core/query-pagination-previous' === $name) {
		if ($page > 1) {
			$target = $page - 1;
			$href   = (1 === $target) ? $base_uri : trailingslashit($base_uri) . 'page/' . $target . '/';
			$is_enabled = true;
		}
	} elseif ('core/query-pagination-next' === $name) {
		$can_go_next = (null === $max_pages) ? true : ($page < $max_pages);
		if ($can_go_next) {
			$target = $page + 1;
			$href   = trailingslashit($base_uri) . 'page/' . $target . '/';
			$is_enabled = true;
		}
	}

	$attributes['href']       = $href;
	$attributes['label']      = $label;
	$attributes['isDisabled'] = ! $is_enabled;

	$block[$attrs_key] = $attributes;
	return $block;
}
