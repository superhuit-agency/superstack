<?php

namespace SUPT\GraphQL;

class ArchivePageField {

	/**
	 * Action & filter hooks
	 */
	function __construct() {
		add_filter( 'graphql_register_types', [$this, 'graphql_register_type_archive'] );
	}

	/**
	 * Register custom `archive` field in PageType
	 */
	function graphql_register_type_archive() {

		register_graphql_object_type( 'ArchivePageType', [
			'fields' => [
				'type'    => [ 'type' => 'String' ],
				'baseUri' => [ 'type' => 'String' ],
				'perPage' => [ 'type' => 'Int' ],
			]
		]);

		// Register on pages
		register_graphql_field( 'Page', 'archivePage', [
			'type'        => 'ArchivePageType',
			'description' => _x( 'The archive page parameters if this is an actual archive page.', 'GraphQL field desc', 'supt' ),
			'resolve'     => function($source, $args, $context, $info) {
				return apply_filters( 'spck_graphql_archive_page_field_resolver', null, $source, $args, $context, $info );
			}
		]);
		// Register on terms/taxonomies
		register_graphql_field( 'TermNode', 'archivePage', [
			'type'        => 'ArchivePageType',
			'description' => _x( 'The archive page parameters if this is an actual archive page.', 'GraphQL field desc', 'supt' ),
			'resolve'     => function($source, $args, $context, $info) {
				$isTaxonomy = true;
				return apply_filters( 'spck_graphql_archive_page_field_resolver', null, $source, $isTaxonomy, $args, $context, $info );
			}
		]);
	}
}

new ArchivePageField();
