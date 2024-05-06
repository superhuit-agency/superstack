<?php

namespace SUPT;

use SUPT\Types\Post;

require_once __DIR__.'/get-next-url.php';

add_filter( 'content_save_pre',       __NAMESPACE__.'\save_relative_urls', 100, 1 );
add_filter( 'post_link',              __NAMESPACE__.'\internal_post_link_to_relative', 10, 3 );
add_filter( 'post_type_link',         __NAMESPACE__.'\internal_post_link_to_relative', 10, 3 );
add_filter( 'page_link',              __NAMESPACE__.'\internal_page_link_to_relative', 10, 3 );
add_filter( 'term_link',              __NAMESPACE__.'\internal_term_link_to_relative', 10, 3 );
add_filter( 'wpseo_breadcrumb_links', __NAMESPACE__.'\yoast_breadcrumbs_links' );

/**
 * Converts HREF values to relative on save
 * Ignores: hashtag, relative and not listed domains values
 */
function save_relative_urls( $content ) {
	/**
	 * REGEX (leaving just in case)
	 */

	/*
	$domains = [
		str_replace(['http://', 'https://'], '', get_site_url()),
		"nextinstance.com"
	];

	$pattern = '/(href=.+?["\'])https?:\/\/(('.implode("|", $domains).')(\/?))(.+?["\'])/im';
	$content = preg_replace($pattern, '$1/$5', $content);
	*/

	$https_site_url = get_site_url(null, '', 'https');
	$http_site_url  = str_replace('https', 'http', $https_site_url);
	$next_url = get_next_url();

	/* Example payload
		<a href=\"http://localhost:3000/\">http://localhost/</a><br>
		<a href=\"http://localhost:3000\">http://localhost</a><br>
		<a href=\"http://localhost/en/page-1/\">http://localhost/en/page-1/</a><br>
		<a href=\"http://localhost/en/page-1\">http://localhost/en/page-1</a><br>
		<a href=\"http://localhost:3000/en/page-1/\">http://localhost:3000/en/page-1/</a><br>
		<a href=\"http://localhost:3000/en/page-1\">http://localhost:3000/en/page-1</a>
		{"link":{"href":"http://localhost:3000/team/jason-camm"}}
	*/

	// caution! order of replacement is important here
	$replacements = [
		// html
		'href=\"' . $next_url . '/',
		'href=\"' . $next_url,
		'href=\"' . $http_site_url . '/',
		'href=\"' . $https_site_url . '/',
		'href=\"' . $http_site_url,
		'href=\"' . $https_site_url
	];

	$replacementsEscaped = [
		// escaped html (i.e. escaped html in gutenberg blocks RichText content)
		'href=\\\\u0022' . $next_url . '/',
		'href=\\\\u0022' . $next_url,
		'href=\\\\u0022' . $http_site_url . '/',
		'href=\\\\u0022' . $https_site_url . '/',
		'href=\\\\u0022' . $http_site_url,
		'href=\\\\u0022' . $https_site_url
	];

	$replacementsJson = [
		// json (i.e. serialized gutenberg blocks attributes like {"link":{"href":"http://localhost:3000/team/jason-camm"}})
		'\"href\":\"' . $next_url . '/',
		'\"href\":\"' . $next_url,
		'\"href\":\"' . $http_site_url . '/',
		'\"href\":\"' . $https_site_url . '/',
		'\"href\":\"' . $http_site_url,
		'\"href\":\"' . $https_site_url
	];

	$content = str_replace( $replacements, 'href=\"/', $content );
	$content = str_replace( $replacementsEscaped, 'href=\\\\u0022/', $content );
	$content = str_replace( $replacementsJson, '\"href\":\"/', $content );

  return $content;
}

function internal_post_link_to_relative(  $permalink, $post, $leavename = false ) {
	// If URL contains `post name` then return the `permalink` as it is to avoid conflict on Post Edit caused by Yoast.
	if ( $leavename ) {
		return $permalink;
	}

	$post_types = apply_filters( 'spck_internal_post_link_post_types', [ Post::NAME ] );
	if ( in_array($post->post_type, $post_types) ) {
		$permalink = wp_make_link_relative($permalink);
	}
	return $permalink;
}

function internal_page_link_to_relative($link, $post_id, $leavename ) {
	// If URL contains `pagename` then return the `permalink` as it is to avoid conflict on Page Edit caused by Yoast.
	if ( $leavename ) {
		return $link;
	}

	$link = wp_make_link_relative($link);
	return $link;
}

function internal_term_link_to_relative($termlink, $term, $taxonomy ) {
	return wp_make_link_relative($termlink);
}

function yoast_breadcrumbs_links($links) {
	return array_map(function($item) {
		$item['url'] = wp_make_link_relative($item['url']);
	return $item;
	}, $links);
}
