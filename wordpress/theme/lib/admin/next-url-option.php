<?php

namespace SUPT\Admin\NextUrl;

add_action( 'admin_init', __NAMESPACE__.'\register_next_url_setting' );


function register_next_url_setting() {

	register_setting(
		'general',
		'next_url',
		[
			'type'              => 'string',
			'description'       => __("Next.js' address of the website's front end.", 'supt'),
			'show_in_rest'      => true,
			'sanitize_callback' => __NAMESPACE__.'\sanitize_url',
			]
	);

	add_settings_field(
		'next_url',
		__('Next.js URL', 'supt'),
		__NAMESPACE__.'\render_field',
		'general',
		'default'
	);
}

function sanitize_url( $value ) {
	return filter_var($value, FILTER_SANITIZE_URL);
}

function render_field( $args ) {
	printf(
		'<input name="%1$s" type="url" id="%1$s" aria-describedby="%1$s-description" value="%2$s" class="regular-text code"/><p class="description" id="%1$s-description">%3$s</p>',
		'next_url',
		esc_attr( get_option( 'next_url' ) ),
		__("Next.js' address of the website's front end.", 'supt')
	);
}
