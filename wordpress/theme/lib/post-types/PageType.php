<?php

namespace SUPT\Types;


class Page extends Type {

	/**
	 * Constants
	 */
	const NAME = 'page';
	const GRAPHQL_TYPE_NAME = 'Page';

	/**
	 * Bind all you action & filter hooks in here.
	 */
	function __construct() {
		parent::__construct();

		add_filter( 'manage_page_posts_columns',  [$this, 'edit_pagelist_columns'] );

		add_action( 'manage_page_posts_custom_column',  [$this, 'pagelist_values_columns'], 10, 2 );
		add_action( 'admin_head',  [$this, 'column_width'] );

		// Register the page template filename for WP Graphql
		add_action( 'graphql_register_types',  [$this, 'register_template_filename_graphql'] );
		add_filter( 'graphql_post_object_connection_query_args', [$this, 'graphql_template_filename_connection_query_args'], 10, 3 );
	}

	function register() {
		// Built-in post-type. no need to re-register.
		// But you can for instance make the post-type non public or rename it.
	}

	function getName() { return self::NAME; }
	function getGraphQLTypeName() { return self::GRAPHQL_TYPE_NAME; }

	function edit_pagelist_columns($columns) {
		return array_merge(
			array_slice($columns, 0, 2),   // 2 first columns (by default: cb and title)
			['slug' => __('Slug')],        // add new slug column
			array_slice($columns, 2, null) // remaining columns
		);
	}

	function pagelist_values_columns($column, $post_id) {
		if ($column === 'slug') {
			$post = get_post($post_id);
			$slug = $post->post_name;
			echo $slug;
		}
	}

	function column_width() {
			echo '<style type="text/css">';
			echo '.wp-admin.post-type-page .column-slug { width: 10% }';
			echo '</style>';
	}

	/**
	 * Register custom `filename` field in
	 * GraphQL to get & filter by page templates
	 */
	function register_template_filename_graphql() {
		register_graphql_field( 'ContentTemplate', 'templateFilename', [
			'type'        => 'String',
			'description' => __( 'The filename of the template', 'supt' ),
			'resolve'     => function() {
				return basename(get_page_template());
			}
		] );

		register_graphql_input_type(
			'TemplateQueryInput',
			[
				'description' => __( 'Filter the connection based on page templates', 'supt' ),
				'fields'      => [
					'in'      => [
						'type'        => [ 'list_of' => 'String' ],
						'description' => __( "Array of page's template filename to filter by", 'supt' ),
					],
					'notIn'     => [
						'type'        => [ 'list_of' => 'String' ],
						'description' => __( "Array of page's template filename to not be filter by", 'supt' ),
					],
				]
			]
		);

		register_graphql_field("RootQueryToPageConnectionWhereArgs", 'template', [
			'type'        => 'TemplateQueryInput',
			'description' => __("Filter the connection based on page templates", 'supt'),
		]);
	}

	/**
	 * Handle the filtering (where) of GraphQL connection query args
	 * @source https://stackoverflow.com/a/69078808/5078169
	 */
	function graphql_template_filename_connection_query_args($query_args, $source, $args) {
		// bail early;
		if ( empty($args['where']['template']) ) return $query_args;

		$template = $args['where']['template'];
		$meta_args = [];
		if ( !empty($template['in']) ) $meta_args[] = [
			'key'     => '_wp_page_template',
			'value'   => $template['in'],
			'compare' => 'IN'
		];
		if ( !empty($template['notIn']) ) {
			$meta_args[] = [
				[
					'key'     => '_wp_page_template',
					'value'   => $template['notIn'],
					'compare' => 'NOT IN'
				],
				'relation' => 'OR',
				[
					'key'     => '_wp_page_template',
					'compare' => 'NOT EXISTS'
				]
			];
		}

		$query_args['meta_query'] = ( isset($query_args['meta_query'])
			? array_merge($query_args['meta_query'], $meta_args)
			: $meta_args
		);

		return $query_args;
	}

}

new Page();
