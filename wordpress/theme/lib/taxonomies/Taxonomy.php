<?php

namespace SUPT\Taxonomies;

abstract class Taxonomy {

	// const NAME = '';
	// const PLURAL_NAME = '';
	// const GRAPHQL_TAXONOMY_NAME = '';

	abstract function getName();
	abstract function getPluralName();
	abstract function register();
	abstract function getConnectedGraphQLTypeName();
	abstract function getWhereArg();

	/**
	 * Bind all you action & filter hooks in here.
	 */
	function __construct() {
		add_action( 'init', [$this, 'register'] );

		add_action( 'graphql_register_types', [ $this, 'graphql_register_category_to_post_where_args' ] );
		add_filter( 'graphql_post_object_connection_query_args', [ $this, 'graphql_resolve_category_to_post_where_args' ], 10, 5);
	}

	function graphql_register_category_to_post_where_args () {
		$graphQLTypeName = $this->getConnectedGraphQLTypeName();
		register_graphql_field('RootQueryTo'. $graphQLTypeName .'ConnectionWhereArgs', $this->getWhereArg(), [
			'type'  => [
				'list_of' => 'ID',
			],
			'description' => __('Array of category IDs, used to display objects from one category OR another', 'supt'),
		]);
	}

	function graphql_resolve_category_to_post_where_args ($query_args, $source, $args, $context, $info) {
		$whereArg = $this->getWhereArg();
		if (isset($args['where'][$whereArg]) && !empty($args['where'][$whereArg])) {

			// Check to be sure it is an array
			if ( !is_array($query_args['tax_query'] ?? null) ) $query_args['tax_query'] = [];

			$query_args['tax_query'][] = [
				'taxonomy' => $this->getName(),
				'terms'		 => $args['where'][$whereArg],
			];
		}

		return $query_args;
	}
}
