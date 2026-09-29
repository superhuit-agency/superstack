<?php

namespace Superstack;

function get_next_url() {
	if (!empty($_ENV['NEXT_URL'])) {
		return $_ENV['NEXT_URL'];
	}

	if (!empty(get_option('next_url'))) {
		return get_option('next_url');
	}

	return 'http://localhost:3000';
}

/**
 * Allow wp_safe_redirect() to send logged-in users to the Next.js frontend.
 * Without this, cross-domain redirects fall back to wp-admin.
 */
add_filter('allowed_redirect_hosts', __NAMESPACE__ . '\allow_next_host');
function allow_next_host($hosts) {
	$next_url = get_next_url();
	if ($next_url) {
		$host = wp_parse_url($next_url, PHP_URL_HOST);
		if ($host) $hosts[] = $host;
	}
	return $hosts;
}
