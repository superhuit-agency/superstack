<?php

namespace SUPT\GraphQL\NodeIdTypeArg;

use WPGraphQL\Model\Post;

add_filter( 'graphql_RootQuery_fields',  __NAMESPACE__.'\register_arg', 20);
add_filter( 'graphql_pre_resolve_field', __NAMESPACE__.'\pre_resolve', 20, 9);

/**
 * Register idType argument to node RootQuery
 */
function register_arg($fields) {
	if ( isset($fields['node']) ) {
		$fields['node']['args']['idType'] = [
			'type'        => 'ContentNodeIdTypeEnum',
			'description' => __( 'Type of unique identifier to fetch a menu by. Default is Global ID', 'supt' ),
		];
		$fields['node']['args']['stati'] = [
			'type'        => ['list_of' => 'PostStatusEnum'],
			'description' => __( 'The status of the object.', 'supt' ),
		];
	}

	return $fields;
}

/**
 * Pre-resolve node RootQuery if idType argument is "database_id"
 */
function pre_resolve($result, $source, $args, $context, $info, $type_name, $field_key, $field, $field_resolver) {

	if ( $type_name === 'RootQuery' && $field_key === 'node') {
		$id      = absint( $args['id'] );
		$id_type = isset( $args['idType'] ) ? $args['idType'] : 'id';

		if ( isset($args['stati']) ) {
			add_filter(
				'graphql_pre_model_data_is_private',
				function($is_private) use ( $args ) {

					// Check if user has right to see draft/private/future/pending posts (if stati request it)
					$user_can = ( boolval(array_intersect( $args['stati'], ['draft', 'private', 'pending', 'future', ] ))
						? ( current_user_can( 'read_private_posts' ) || current_user_can( 'read_private_pages' ) ) // TODO: Fix for "Contributor" role as this won't work
						: $user_can = true
					);

					return !$user_can;
				}
			);
		}

		if ( $id_type === 'database_id' && !empty($id) ) {
			$result = new Post( get_post($id) );
		}
	}
	return $result;
}
