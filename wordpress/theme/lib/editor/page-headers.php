<?php

namespace SUPT\Editor;

/**
 * Handle Page Header for front page and all other pages and posts
 */

add_action('init', __NAMESPACE__ . '\default_page_header_template');

function default_page_header_template() {
	$post_type_object = get_post_type_object( 'post' );
	$post_type_object->template = [
			[ 'supt/page-header'],
	];

	if(is_front_page()) {
		$page_type_object = get_post_type_object( 'page' );
		$page_type_object->template = [
			[ 'supt/page-header' ],
		];
	} else {
		$page_type_object = get_post_type_object( 'page' );
		$page_type_object->template = [
			[ 'supt/page-header' ],
		];
	}
};
