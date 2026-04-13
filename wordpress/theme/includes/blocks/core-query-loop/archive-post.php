<?php

namespace Superstack\Blocks\CoreQueryLoop;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Query Loop for archive post template blocks.
 *
 * @package Superstack
 * @subpackage Superstack/Blocks/CoreQueryLoop
 * @since 1.0.0
 */
class Query_Archive_Post {

	use Singleton;

	/**
	 * ID of the top post (sticky or fallback latest post) on home page.
	 *
	 * @var int|null
	 */
	private static $top_post_id = null;

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_filter('pre_render_block', [$this, 'register_sticky_post_fallback_query_vars'], 10, 3);
		add_filter('pre_render_block', [$this, 'register_posts_query_vars'], 10, 3);
	}

	/**
	 * Get the top post ID (most recent sticky post, or latest post as fallback).
	 *
	 * @access private
	 * @return int|null Post ID or null if no posts found.
	 */
	private function get_top_post_id() {
		if (null !== self::$top_post_id) {
			return self::$top_post_id;
		}

		$sticky_posts = get_option('sticky_posts', []);

		if (! empty($sticky_posts)) {
			$sticky_query = new \WP_Query([
				'post__in'            => $sticky_posts,
				'posts_per_page'      => 1,
				'orderby'             => 'date',
				'order'               => 'DESC',
				'post_type'           => 'post',
				'ignore_sticky_posts' => false,
				'fields'              => 'ids',
			]);

			if ($sticky_query->have_posts() && ! empty($sticky_query->posts)) {
				self::$top_post_id = $sticky_query->posts[0];
			}
		}

		if (empty(self::$top_post_id)) {
			$latest_query = new \WP_Query([
				'posts_per_page'      => 1,
				'orderby'             => 'date',
				'order'               => 'DESC',
				'post_type'           => 'post',
				'ignore_sticky_posts' => true,
				'fields'              => 'ids',
			]);

			if ($latest_query->have_posts() && ! empty($latest_query->posts)) {
				self::$top_post_id = $latest_query->posts[0];
			}
		}

		wp_reset_postdata();

		return self::$top_post_id;
	}

	/**
	 * Register the sticky post fallback query vars.
	 * If no sticky posts exist, falls back to the latest post.
	 * ⚠️ Always return `null` to not short-circuited the block rendering.
	 *
	 * @access public
	 * @param string|null $pre_render   The pre-rendered content. Default null.
	 * @param array       $parsed_block An associative array of the block being rendered.
	 * @param array       $parent_block The parent block.
	 * @return null
	 */
	public function register_sticky_post_fallback_query_vars($pre_render, $parsed_block, $parent_block) {
		if ('core/query' !== ($parsed_block['blockName'] ?? '')) {
			return $pre_render;
		}

		$namespace = $parsed_block['attrs']['namespace'] ?? '';
		if ('superstack/archive-post-highlight' !== $namespace) {
			return $pre_render;
		}

		$top_post_id = $this->get_top_post_id();

		if (null === $top_post_id) {
			// We return null because no sticky nor latest post found. Therefore the block will not be rendered.
			return null;
		}

		add_filter(
			'query_loop_block_query_vars',
			function ($query, $block) use ($parsed_block, $top_post_id) {
				if (
					isset($block->context['queryId'])
					&& $block->context['queryId'] === $parsed_block['attrs']['queryId']
				) {

					$query['post__in'] = [$top_post_id];
				}

				return $query;
			},
			99,
			2
		);

		return $pre_render;
	}

	/**
	 * Register the home page posts query vars to show sticky posts first (excluding top post), then regular posts.
	 * ⚠️ Always return `null` to not short-circuited the block rendering.
	 *
	 * @access public
	 * @param string|null $pre_render   The pre-rendered content. Default null.
	 * @param array       $parsed_block An associative array of the block being rendered.
	 * @param array       $parent_block The parent block.
	 * @return null
	 */
	public function register_posts_query_vars($pre_render, $parsed_block, $parent_block) {
		if ('core/query' !== ($parsed_block['blockName'] ?? '')) {
			return $pre_render;
		}

		$namespace = $parsed_block['attrs']['namespace'] ?? '';
		if ('superstack/archive-post' !== $namespace) {
			return $pre_render;
		}

		$top_post_id = $this->get_top_post_id();

		add_filter(
			'query_loop_block_query_vars',
			function ($query, $block) use ($parsed_block, $top_post_id) {
				if (
					isset($block->context['queryId'])
					&& $block->context['queryId'] === $parsed_block['attrs']['queryId']
				) {

					if (! empty($top_post_id)) {
						$query['post__not_in']   = [$top_post_id];
						$query['posts_per_page'] = get_option('posts_per_page');
					}

					// Avoid repeating the sticky posts in paginated pages.
					if ($query['offset'] > 0) {
						$query['ignore_sticky_posts'] = true;
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

Query_Archive_Post::get_instance()->init();
