<?php

namespace Supt\Taxonomies\Category;

use WPGraphQL\Data\Connection\TermObjectConnectionResolver;

/**
 * Constants
 */
const TAXONOMY_NAME = 'category';
const GRAPHQL_TAXONOMY_TYPE = 'Category';

/**
 * Action & filter hooks
 */
add_filter( 'spck_archive_interface_to_types', __NAMESPACE__.'\archive_interface_to_category' );
add_action( 'graphql_register_types',          __NAMESPACE__.'\graphql_register_category_to_archive_filters' );

/**
 * GraphQL: Add Archive Interface to Category type
 */
function archive_interface_to_category( $types ) {
	$types[] = GRAPHQL_TAXONOMY_TYPE;
	return $types;
}


/**
 * Register a connection between ArchiveFiltersFieldsType to Categories
 * in order to retrieve categories for the current archive page
 */
function graphql_register_category_to_archive_filters() {
	register_graphql_connection([
		'fromType'      => 'ArchiveFiltersFieldsType',
		'toType'        => GRAPHQL_TAXONOMY_TYPE,
		'queryClass'    => 'WP_Term_Query',
		'fromFieldName' => 'categories',
		'resolve'       => function( $source, $args, $context, $info ) {
			global $wp;

			$resolver = new TermObjectConnectionResolver( $source, $args, $context, $info, TAXONOMY_NAME );
			$resolver->set_query_arg( 'hide_empty', true );
			$resolver->set_query_arg( 'number', 0 );

			// TODO: maybe move to i18n plugin
			if ( !empty($wp->query_vars['lang']) ) {
				$resolver->set_query_arg( 'lang', $wp->query_vars['lang'] );
			}

			return $resolver->get_connection();
		},
	]);
}
