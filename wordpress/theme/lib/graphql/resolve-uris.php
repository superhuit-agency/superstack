<?php

namespace SUPT\GraphQL;

use function SUPT\get_next_url;

class ResolveUris {

	// Fields that need to have a relative url
	const RELATIVE_URI_FIELDS = [
		'uri',
		'url',
		'link',
		'guid',
		'sourceUrl',
		'mediaItemUrl',
	];

	// Fields that need to have the absolute URI with the FE domain (Next.js url)
	const ABSOLUTE_URI_FIELDS = [
		'canonical',
		'siteUrl',
		'opengraphUrl',
	];

	function __construct() {
		add_filter( 'graphql_resolve_field', [$this, 'graphql_resolve_relative_uris'], 10, 9 );
		add_filter( 'graphql_resolve_field', [$this, 'graphql_resolve_absolute_uris'], 10, 9 );
	}

	/**
	 * Make any of the fields listed in RELATIVE_URI_FIELDS a relative URI
	 *
	 * @param mixed           $result         The result of the field resolution
	 * @param mixed           $source         The source passed down the Resolve Tree
	 * @param array           $args           The args for the field
	 * @param AppContext      $context        The AppContext passed down the ResolveTree
	 * @param ResolveInfo     $info           The ResolveInfo passed down the ResolveTree
	 * @param string          $type_name      The name of the type the fields belong to
	 * @param string          $field_key      The name of the field
	 * @param FieldDefinition $field          The Field Definition for the resolving field
	 * @param mixed           $field_resolver The default field resolver
	 *
	 * @return mixed
	 */
	function graphql_resolve_relative_uris( $result, $source, $args, $context, $info, $type_name, $field_key, $field, $field_resolver ) {
		// Bail early if not the field we are interrested in.
		if ( !in_array($field_key, self::RELATIVE_URI_FIELDS) ) return $result;

		$site_url = preg_replace( '/https?:\/\//', '', get_site_url() );
		$next_url = preg_replace( '/https?:\/\//', '', get_next_url() );

		// Do not continue if the result is not a BE nor a FE url
		if (! preg_match( "/^https?:\/\/($site_url|$next_url)/i", $result) ) return $result;

		return wp_make_link_relative( $result );
	}

	/**
	 * Make any of the fields listed in ABSOLUTE_URI_FIELDS a absolute URI with the FE domain (Next.js url)
	 *
	 * @param mixed           $result         The result of the field resolution
	 * @param mixed           $source         The source passed down the Resolve Tree
	 * @param array           $args           The args for the field
	 * @param AppContext      $context        The AppContext passed down the ResolveTree
	 * @param ResolveInfo     $info           The ResolveInfo passed down the ResolveTree
	 * @param string          $type_name      The name of the type the fields belong to
	 * @param string          $field_key      The name of the field
	 * @param FieldDefinition $field          The Field Definition for the resolving field
	 * @param mixed           $field_resolver The default field resolver
	 *
	 * @return mixed
	 */
	function graphql_resolve_absolute_uris( $result, $source, $args, $context, $info, $type_name, $field_key, $field, $field_resolver ) {
		return ( in_array($field_key, self::ABSOLUTE_URI_FIELDS)
		 	? trailingslashit( trim(get_next_url(), "/") . wp_make_link_relative( $result ) )
			: $result
		);
	}
}

new ResolveUris();
