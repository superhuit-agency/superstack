<?php

namespace Superstack\Blocks\CoreQueryLoop;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Query Loop Block for related posts section.
 *
 * @package Superstack
 * @subpackage Superstack/Blocks/CoreQueryLoop
 * @since 1.0.0
 */
class Query_Related_Posts {

	use Singleton;

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_filter('pre_render_block', [$this, 'register_related_posts_query_vars'], 10, 3);
	}

	/**
	 * Register the related posts by category query vars in the pre_render_block filter.
	 * ⚠️ Always return `null` to not short-circuited the block rendering.
	 *
	 * @access public
	 * @param string|null $pre_render   The pre-rendered content. Default null.
	 * @param array       $parsed_block An associative array of the block being rendered.
	 * @param array       $parent_block The parent block.
	 * @return null
	 */
	public function register_related_posts_query_vars($pre_render, $parsed_block, $parent_block) {
		if (! isset($parsed_block['attrs']['namespace']) || 'superstack/related-posts-by-category' !== $parsed_block['attrs']['namespace']) {
			return $pre_render;
		}

		global $post;
		$current_post_id = null;
		$categories      = [];

		if (null === $post || !is_singular('post')) {
			return $pre_render;
		}

		$current_post_id = $post->ID;
		$categories      = wp_get_post_categories($current_post_id);

		add_filter(
			'query_loop_block_query_vars',
			function ($query, $block) use ($parsed_block, $current_post_id, $categories) {
				if (
					isset($block->context['queryId'])
					&& $block->context['queryId'] === $parsed_block['attrs']['queryId']
				) {
					$query['ignore_sticky_posts'] = true;
					$query['post__not_in']        = [$current_post_id];

					if (! empty($categories)) {
						$query['category__in'] = $categories;

						$test_query = new \WP_Query($query);
						$found_posts = $test_query->found_posts;
						wp_reset_postdata();

						if (0 === $found_posts) {
							unset($query['category__in']);
						}
					}
				}

				return $query;
			},
			99,
			2
		);

		return $pre_render;
	}
}

Query_Related_Posts::get_instance()->init();
