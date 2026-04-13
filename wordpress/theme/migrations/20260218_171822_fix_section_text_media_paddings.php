<?php

/**
 * Migration: Fix section-text-media pattern paddings
 *
 * Updates padding values on the spck-text-media section:
 * - bottom: spacing|80 → spacing|100
 * - left/right: spacing|40 → spacing|50
 *
 * Related commit: 533068d03de940162d9a783d17d7d27e22646644
 *
 * @package Superstack
 * @since   1.0.0
 */

if (! defined('ABSPATH')) {
	exit;
}

return [
	// Block comment JSON padding object
	'search-replace' .
		' "\"padding\":{\"top\":\"var:preset|spacing|100\",\"bottom\":\"var:preset|spacing|80\",\"left\":\"var:preset|spacing|40\",\"right\":\"var:preset|spacing|40\"}"' .
		' "\"padding\":{\"top\":\"var:preset|spacing|100\",\"bottom\":\"var:preset|spacing|100\",\"left\":\"var:preset|spacing|50\",\"right\":\"var:preset|spacing|50\"}"' .
		' --report-changed-only',

	// Inline style attribute
	'search-replace' .
		' "padding-top:var(--wp--preset--spacing--100);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--40)"' .
		' "padding-top:var(--wp--preset--spacing--100);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--100);padding-left:var(--wp--preset--spacing--50)"' .
		' --report-changed-only',
];
