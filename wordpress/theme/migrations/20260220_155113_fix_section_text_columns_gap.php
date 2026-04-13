<?php

/**
 * Migration: Fix section-text column block gap
 *
 * Adds a blockGap style to the columns block inside spck-section-text.
 * Uses regex with \K to anchor the match to the spck-section-text class,
 * ensuring user-created columns blocks are not affected.
 *
 * Related commit: d6452f341cbac81344128b33d17d05785c092806
 *
 * @package Superstack
 * @since   1.0.0
 */

if (! defined('ABSPATH')) {
	exit;
}

return [
	'search-replace' .
		' "spck-section-text[\\s\\S]*?\\K<!-- wp:columns \\{\\"lock\\":\\{\\"move\\":true,\\"remove\\":true\\}\\} -->"' .
		' "<!-- wp:columns {\\"lock\\":{\\"move\\":true,\\"remove\\":true},\\"style\\":{\\"spacing\\":{\\"blockGap\\":{\\"left\\":\\"var:preset|spacing|70\\"}}}} -->"' .
		' --regex --report-changed-only',
];
