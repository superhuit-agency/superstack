<?php

namespace SUPT\Admin;

add_filter('mime_types', __NAMESPACE__ . '\add_font_mime_types');


function add_font_mime_types($existing_mimes) {
	// Add webm to the list of mime types.
	$existing_mimes['woff'] = 'application/octet-stream';
	$existing_mimes['woff2'] = 'application/octet-stream';

	// Return the array back to the function with our added mime type.
	return $existing_mimes;
}
