<?php

namespace SUPT;

/**
 * Test if a given url returns 200.
 */
function get_remote_json($url) {
	$curl = curl_init($url);

	// Will return the response, if false it print the response
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

	// Debug options
	if (WP_DEBUG) {
		if ( is_ssl() ) {
			curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
			curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		}
		// curl_setopt($curl, CURLOPT_VERBOSE, true); // to debug only
	}

	$content = curl_exec($curl);
	$code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
	curl_close( $curl );

	return ($content === false || $code == 404)
		? false
		: json_decode($content);
}
