<?php

namespace SUPT\GraphQL;

require_once __DIR__ .'/archive-page.php';
require_once __DIR__ .'/post-edit-link.php';
require_once __DIR__ .'/register-logo.php';
require_once __DIR__ .'/node-idtype.php';
require_once __DIR__ .'/resolve-uris.php';


add_filter( 'supt-localize-script', function( $attrs ) {

	// Is WPGraphQL active?
	if ( class_exists( 'WPGraphQL' ) ) {
		$attrs['graphql'] = [
			'nonce'    => wp_create_nonce( 'wp_rest' ),
			'endpoint' => trailingslashit( site_url() ) . 'index.php?' . \WPGraphQL\Router::$route,
		];
	}

	return $attrs;
});
