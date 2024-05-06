<?php

namespace SUPT\GraphQL;

class EditLink {

	function __construct() {
		add_filter( 'graphql_register_types', [$this, 'register_edit_link_field'], 20 );
	}

	function register_edit_link_field() {

			register_graphql_field( 'ContentNode', 'editLink', [
				'type'        => 'String',
				'description' => _x( 'Retrieves the object edit link', 'GraphQL field desc', 'supt' ),
				'resolve'     => function ( $source ) {
					$ID = wp_is_post_revision( $source->ID );
					$is_revision = ($ID !== false);
					return get_edit_post_link( $is_revision ? $ID : $source->ID );
				}
			] );
	}
}

new EditLink();
