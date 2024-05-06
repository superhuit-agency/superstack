<?php

namespace SUPT\Types;

// Models
require_once __DIR__ . '/Type.php';
require_once __DIR__ . '/TypeWithArchive.php';

/**
 * CUSTOM POST TYPES
 * =================
 *
 * Custom post types and their associated taxonomies
 */

require_once __DIR__ . '/PostType.php';
require_once __DIR__ . '/PageType.php';

// Initialize post types
$post_types = [
	// 'my-cpt'		=> new MyCpt(),
];
