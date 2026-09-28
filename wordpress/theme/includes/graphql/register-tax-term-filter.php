<?php

namespace Superstack\GraphQL\TaxTermFilter;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Where arg used to scope a content node connection to taxonomy terms.
 *
 * @var string
 */
const WHERE_ARG = 'taxTermIn';

add_action('graphql_register_types', __NAMESPACE__ . '\register_where_arg');
add_filter('graphql_map_input_fields_to_wp_query', __NAMESPACE__ . '\map_to_tax_query', 10, 2);

/**
 * Adds a `taxTermIn` where arg to the root content node connection.
 *
 * WPGraphQL only exposes taxonomy filters for `category` and `post_tag` (via the
 * posts connection); custom taxonomies have none, so a query loop rendered on a
 * custom term archive has no way to list only that term's content.
 *
 * @access public
 * @return void
 */
function register_where_arg() {
	register_graphql_field('RootQueryToContentNodeConnectionWhereArgs', WHERE_ARG, [
		'type'        => ['list_of' => 'ID'],
		'description' => _x('Filter the content nodes by term database IDs, in any taxonomy.', 'GraphQL where arg desc', 'supt'),
	]);
}

/**
 * Translates the `taxTermIn` where arg into the WP_Query `tax_query` the
 * connection resolver runs, grouping the requested terms by taxonomy.
 *
 * @access public
 * @param  array $query_args The WP_Query args mapped so far.
 * @param  array $where_args The where args of the GraphQL connection.
 * @return array
 */
function map_to_tax_query($query_args, $where_args) {
	if (empty($where_args[WHERE_ARG])) return $query_args;

	$terms_by_taxonomy = [];

	foreach ((array) $where_args[WHERE_ARG] as $term_id) {
		$term = get_term((int) $term_id);

		if (! $term || is_wp_error($term)) continue;

		$terms_by_taxonomy[$term->taxonomy][] = (int) $term->term_id;
	}

	if (empty($terms_by_taxonomy)) return $query_args;

	$tax_query = $query_args['tax_query'] ?? [];

	foreach ($terms_by_taxonomy as $taxonomy => $term_ids) {
		$tax_query[] = [
			'taxonomy'         => $taxonomy,
			'field'            => 'term_id',
			'terms'            => $term_ids,
			'include_children' => true,
		];
	}

	// Terms of different taxonomies must all match, mirroring the way WordPress
	// narrows a term archive.
	if (count($tax_query) > 1) $tax_query['relation'] = 'AND';

	$query_args['tax_query'] = $tax_query;

	return $query_args;
}
