<?php

namespace SUPT\Blocks\Parser;

use WP_Block_Parser;

/**
 * Action & filter hooks
 */
add_filter( 'block_parser_class', function() {
	return __NAMESPACE__.'\BlockParser';
} );

class BlockParser extends WP_Block_Parser {

	function parse($document) {
		parent::parse($document);

		do_action( 'spck_blockparser_parse', $this, $document );

		return array_map([$this, 'format_block'], $this->output);
	}

	function format_block($block) {

		if ( empty($block['blockName']) ) return $block;

		if ( count($block['innerBlocks']) ) {
			$block['innerBlocks'] = array_map([$this, 'format_block'], $block['innerBlocks']);
		}

		/**
		 * Filter the parsed block
		 */

		// => same filter for all blocks
		$block = apply_filters( 'spck_blockparser_format_block', $block, $this );

		// => specific filter for each block
		$block_name_escaped = str_replace(['/', '-'], '_', $block['blockName'] );
		return apply_filters( "spck_blockparser_format_block-$block_name_escaped", $block, $this );
	}
}
