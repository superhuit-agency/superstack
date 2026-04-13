<?php

namespace Superstack\Blocks\CoreQueryLoop;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Query Loop for archive partner template blocks.
 *
 * @package Superstack
 * @subpackage Superstack/Blocks/CoreQueryLoop
 * @since 1.0.0
 */
class Query_Archive_Partner {

	use Singleton;

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_filter('pre_render_block', [$this, 'register_archive_partner_query_vars'], 10, 3);
	}

	/**
	 * Register the archive partner query vars. in the pre_render_block filter.
	 * ⚠️ Always return `null` to not short-circuited the block rendering.
	 *
	 * @access public
	 * @return null
	 * @param string|null $pre_render   The pre-rendered content. Default null.
	 * @param array       $block        An associative array of the block being rendered. See WP_Block_Parser_Block..
	 * @param array       $parent_block The parent block.
	 * @return null
	 */
	public function register_archive_partner_query_vars($pre_render, $parsed_block, $parent_block) {
		if (! isset($parsed_block['attrs']['namespace']) || 'superstack/archive-partner' !== $parsed_block['attrs']['namespace']) {
			return $pre_render;
		}

		add_filter(
			'query_loop_block_query_vars',
			function ($query, $block) use ($parsed_block) {
				if (
					isset($block->context['queryId'])
					&& $block->context['queryId'] === $parsed_block['attrs']['queryId']
				) {
					$query['per_page'] = -1;
					$query['posts_per_page'] = -1;
				}
				return $query;
			},
			99,
			2
		);

		return $pre_render;
	}
}

Query_Archive_Partner::get_instance()->init();
