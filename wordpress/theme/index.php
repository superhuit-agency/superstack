<?php

use WPGraphQL\JWT_Authentication\Auth;

use function SUPT\get_next_url;

if (wp_doing_ajax()) {
	wp_die();
}

$next_url = get_next_url();

// Redirect to Next.js preview url
if (is_user_logged_in()) {
	$id = get_queried_object_id();

	if (empty($id)) wp_die();

	$token = Auth::get_refresh_token( wp_get_current_user() );

	// generate a rest nonce to allow Next to authenticate
	// requests made to the REST API
	$rest_nonce = wp_create_nonce( 'wp_rest' );

	$draft_preview = (true == get_query_var('preview'));

	header("Location: $next_url/api/preview/?secret=spck&id=$id&token=$token&nonce=$rest_nonce".($draft_preview ? "&draft=true" : ""));
	exit();
}

header("Location: $next_url");
exit();
