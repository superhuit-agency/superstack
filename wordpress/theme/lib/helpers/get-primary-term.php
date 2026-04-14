<?php

namespace SUPT;

use WPSEO_Primary_Term;
use const Supt\Taxonomies\Category\TAXONOMY_NAME as CATEGORY_TAXONOMY_NAME;

/**
 * Return Yoast primary term if available,
 * or first term taxonomy
 *
 * @param  int              $post_id The post to retrieve the Term from.
 * @param  string           taxonomy Optional. Default: category. The Taxonomy of the term.
 * @return WP_Term|int|null          The primary or first term / term_id.
 */
function get_primary_term( $post_id, $taxonomy = CATEGORY_TAXONOMY_NAME, $return_id = false ) {
	$term = null;

	if ( class_exists('WPSEO_Primary_Term') ) {
		$wpseo_primary_term = new WPSEO_Primary_Term( $taxonomy, $post_id );
		$wpseo_primary_term = $wpseo_primary_term->get_primary_term();
		$term = get_term( $wpseo_primary_term );
	}

	// Default to first category (not Yoast) if an error is returned
	if ( !isset($term) || is_wp_error($term) ) {
		$terms = get_the_terms( $post_id, $taxonomy );
		if ( count($terms) > 0) $term = $terms[0];
	}

	if ( empty($term) ) return null;

	return $return_id ? $term->term_id : $term;
}
