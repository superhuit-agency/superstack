<?php

/**
 * Migration: Factorize section-cards class names
 *
 * Replaces individual section-cards variant classes with a shared
 * `spck-section-cards` class using modifiers (`-text`, `-link`, `-text-link`).
 *
 * Related commit: 3a1bce564a81f8e7ffc550763ef4c61ef123436f
 *
 * @package Superstack
 * @since   1.0.0
 */

if (! defined('ABSPATH')) {
	exit;
}

return [
	// Unify list element classes first (more specific → less specific)
	'search-replace "spck-section-cards-text__list" "spck-section-cards__list" --report-changed-only',
	'search-replace "spck-section-cards-link__list" "spck-section-cards__list" --report-changed-only',
	'search-replace "spck-section-cards-text-link__list" "spck-section-cards__list" --report-changed-only',

	// Replace block classes with shared class + modifier
	'search-replace "spck-section-cards-text-link" "spck-section-cards -text-link" --report-changed-only',
	'search-replace "spck-section-cards-text" "spck-section-cards -text" --report-changed-only',
	'search-replace "spck-section-cards-link" "spck-section-cards -link" --report-changed-only',
];
