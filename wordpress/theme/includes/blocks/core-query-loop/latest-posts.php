<?php

namespace Superstack\Blocks\CoreQueryLoop;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Query Loop Block for latest posts section.
 *
 * @package Superstack
 * @subpackage Superstack/Blocks/CoreQueryLoop
 * @since 1.0.0
 */
class Query_Latest_Posts {

	use Singleton;

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_filter('pre_render_block', [$this, 'register_latest_posts_query_vars'], 10, 3);
	}

	/**
	 * Register the latest posts query vars. in the pre_render_block filter.
	 * ⚠️ Always return `null` to not short-circuited the block rendering.
	 *
	 * @access public
	 * @return null
	 * @param string|null $pre_render   The pre-rendered content. Default null.
	 * @param array       $block        An associative array of the block being rendered. See WP_Block_Parser_Block..
	 * @param array       $parent_block The parent block.
	 * @return null
	 */
	public function register_latest_posts_query_vars($pre_render, $parsed_block, $parent_block) {
		if (! isset($parsed_block['attrs']['namespace']) || 'superstack/latest-posts' !== $parsed_block['attrs']['namespace']) {
			return $pre_render;
		}

		$post_ids = $this->get_mixed_post_ids();

		add_filter(
			'query_loop_block_query_vars',
			function ($query, $block) use ($parsed_block, $post_ids) {
				if (
					isset($block->context['queryId'])
					&& $block->context['queryId'] === $parsed_block['attrs']['queryId']
				) {
					$query['post_type']           = ['post', 'event'];
					$query['post__in']            = ! empty($post_ids) ? $post_ids : [0];
					$query['orderby']             = 'post__in';
					$query['per_page']            = count($post_ids);
					$query['pages']               = 0;
					$query['offset']              = 0;
					$query['ignore_sticky_posts'] = '1';
					$query['inherit']             = false;
				}
				return $query;
			},
			99,
			2
		);

		return $pre_render;
	}

	/**
	 * Fetch a mixed list of latest posts and upcoming events.
	 * Posts first, then events. At most 4 items total, ideally 3 + 1.
	 * If fewer than 1 upcoming events exist, fill remaining slots with posts.
	 *
	 * @access private
	 * @return array List of post IDs.
	 */
	private function get_mixed_post_ids() {
		$total = 4;
		$max_events = 1;

		$events = new \WP_Query([
			'post_type'      => 'event',
			'posts_per_page' => $max_events,
			'meta_key'       => 'event_start_date',
			'orderby'        => 'meta_value',
			'order'          => 'ASC',
			'meta_query'     => [
				[
					'key'     => 'event_start_date',
					'value'   => current_time('Y-m-d H:i:s'),
					'compare' => '>=',
					'type'    => 'DATETIME',
				],
			],
			'fields'                => 'ids',
			'no_found_rows'         => true,
			'update_post_meta_cache' => false,
			'update_post_term_cache' => false,
		]);

		$event_ids  = $events->posts;
		$post_count = $total - count($event_ids);

		$sticky_ids = get_option('sticky_posts', []);
		$sticky_post_ids     = [];
		$non_sticky_post_ids = [];

		if (! empty($sticky_ids)) {
			$sticky_posts = new \WP_Query([
				'post_type'              => 'post',
				'posts_per_page'         => $post_count,
				'post__in'               => $sticky_ids,
				'orderby'                => 'date',
				'order'                  => 'DESC',
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			]);
			$sticky_post_ids = $sticky_posts->posts;
		}

		$remaining = $post_count - count($sticky_post_ids);

		if ($remaining > 0) {
			$non_sticky = new \WP_Query([
				'post_type'              => 'post',
				'posts_per_page'         => $remaining,
				'post__not_in'           => $sticky_ids,
				'orderby'                => 'date',
				'order'                  => 'DESC',
				'ignore_sticky_posts'    => true,
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			]);
			$non_sticky_post_ids = $non_sticky->posts;
		}

		return array_merge($sticky_post_ids, $non_sticky_post_ids, $event_ids);
	}
}

Query_Latest_Posts::get_instance()->init();
