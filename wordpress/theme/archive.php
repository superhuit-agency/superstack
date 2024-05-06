<?php

use function SUPT\get_next_url;

if (wp_doing_ajax()) {
	wp_die();
}

$next_url = get_next_url();

// Redirect to Next.js preview url
if (is_user_logged_in()) {
	$uri = $_SERVER['REQUEST_URI'];

	if (empty($uri)) wp_die();

	$token = \WPGraphQL\JWT_Authentication\Auth::get_refresh_token( wp_get_current_user() );

	header("Location: $next_url/api/preview/?secret=spck&uri=$uri&token=$token");
	exit();
}

header("Location: $next_url");
exit();
