<?php

namespace SUPT\Editor;

// Action & filter hooks
add_filter( 'block_categories_all', __NAMESPACE__ . '\add_block_category' );

/**
 * Adds the structured data blocks category to the Gutenberg categories.
 *
 * @param array $categories The current categories.
 *
 * @return array The updated categories.
 */
function add_block_category( $categories ) {

	// insert new categories in $nth position
	$nth = 1;
	array_splice($categories, $nth, 0, [
		[
			'slug'  => 'spck-text',
			'title' => _x( 'Text', 'editor blocks category', 'supt' ),
		],
		[
			'slug'  => 'spck-card',
			'title' => _x( 'Cards', 'editor blocks category', 'supt' ),
		],
		[
			'slug'  => 'spck-content',
			'title' => _x( 'Content - inform your visitors, build trust', 'editor blocks category', 'supt' ),
		],
		[
			'slug'  => 'spck-action',
			'title' => _x( 'Action - prompt your visitors to act', 'editor blocks category', 'supt' ),
		],
		[
			'slug'  => 'spck-form',
			'title' => _x( 'Forms', 'editor blocks category', 'supt' ),
		],
		[
			'slug'  => 'spck-custom',
			'title' => _x( 'Custom - blocks handcrafted just for you', 'editor blocks category', 'supt' ),
		],
		[
			'slug'  => 'spck-header',
			'title' => _x( 'Headers', 'editor blocks category', 'supt' ),
		]
	]);

	// echo "<pre>"; var_dump($categories); die();

	// rename default categories
	// foreach($categories as &$cat) {
	// 	if ($cat['slug'] == 'common') {
	// 		$cat['title'] = _x( 'Content', 'editor blocks category', 'supt' );
	// 	}
	// 	elseif ($cat['slug'] == 'embed') {
	// 		$cat['title'] = _x( 'Media', 'editor blocks category', 'supt' );
	// 	}
	// 	elseif ($cat['slug'] == 'layout') {
	// 		$cat['title'] = _x( 'Layout & Navigation', 'editor blocks category', 'supt' );
	// 	}
	// }

	return $categories;
}
