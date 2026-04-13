<?php

/**
 * Migration: Change media assets for hero and section patterns
 *
 * Updates asset filenames in existing block content:
 * - hero-text-media.svg → hero-text-media-new.svg
 * - section-text-media-team-work.jpg → section-text-media-team-work.svg
 *
 * Related commit: 8183e180beb13ca04cfb9ee172ebb3f8a6818f1a
 *
 * @package Superstack
 * @since   1.0.0
 */

if (! defined('ABSPATH')) {
	exit;
}

return [
	'search-replace "assets/hero-text-media.svg" "assets/hero-text-media-new.svg" --report-changed-only',
	'search-replace "assets/section-text-media-team-work.jpg" "assets/section-text-media-team-work.svg" --report-changed-only',
];
