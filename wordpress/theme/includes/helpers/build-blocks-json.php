<?php

namespace Superstack;

/**
 * Parses raw post/template content into the normalized `{ name, attributes, innerBlocks }`
 * JSON string shape expected by the Next.js frontend, resolving each block's attributes
 * through WPGraphQLGutenberg's registry — including attributes sourced from `innerHTML`
 * (e.g. `core/paragraph`'s `content`), which a raw `parse_blocks()` call does not compute.
 *
 * @param string $content Raw post/template block content (`post_content`).
 * @return string JSON-encoded blocks.
 */
function build_blocks_json(string $content): string {
	if (empty(trim($content))) return '[]';

	$blocks = \WPGraphQLGutenberg\Blocks\Block::create_blocks(
		parse_blocks($content),
		0,
		\WPGraphQLGutenberg\Blocks\Registry::get_registry()
	);

	return \WPGraphQLGutenberg\Blocks\BlocksJSON::encode_blocks($blocks, null);
}
