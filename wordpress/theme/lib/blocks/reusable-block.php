<?php

namespace SUPT\Blocks\ReusableBlock;

/**
 * Action & filter hooks
 */
add_filter( 'spck_blockparser_format_block-core_block', __NAMESPACE__.'\reusable_block', 10, 2 );

function reusable_block($block, $parser) {
	// Reusable block is saved as a post in the db
	$raw_block = get_post($block['attrs']['ref']);

	// Parse content of the reusable block (this returns an array of block)
	$block_content = parse_blocks( $raw_block->post_content );

	// Get parsed reusable block (it's the 1st item as it's going to be an array of 1 item length)
	$reusable_block = array_shift($block_content);

	// Return the reusable block itself instead of the core/block
	return $reusable_block;
}
