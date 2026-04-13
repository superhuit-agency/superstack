<?php

/**
 * Migration: Remove unnecessary padding from hero-text header
 *
 * The outer header group of the hero-text pattern had explicit padding
 * (top:0, bottom:0, left/right:spacing|50) that is no longer needed.
 * This removes the style attribute from both the block comment JSON
 * and the rendered HTML tag.
 *
 * Related commit: f2c3e10c0b33dd145840ffba0886e213f6c4e7a0
 *
 * @package Superstack
 * @since   1.0.0
 */

if (! defined('ABSPATH')) {
	exit;
}

return [
	'search-replace \'"spck-hero-text","style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"layout"\' \'"spck-hero-text","layout"\' --report-changed-only',
	'search-replace \'<header class="wp-block-group alignfull spck-hero-text" style="padding-top:0;padding-right:var(--wp--preset--spacing--50);padding-bottom:0;padding-left:var(--wp--preset--spacing--50)">\' \'<header class="wp-block-group alignfull spck-hero-text">\' --report-changed-only',
];
