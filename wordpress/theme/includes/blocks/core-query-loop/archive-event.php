<?php

namespace Superstack\Blocks\CoreQueryLoop;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Query Loop for archive event template blocks.
 *
 * @package Superstack
 * @subpackage Superstack/Blocks/CoreQueryLoop
 * @since 1.0.0
 */
class Query_Archive_Event {

	use Singleton;

	/**
	 * Current event query namespace being processed.
	 *
	 * @var string|null
	 */
	private static $current_event_namespace = null;

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_filter('pre_render_block', [$this, 'register_event_queries'], 10, 3);
		add_filter('render_block_data', [$this, 'inject_event_query_per_page']);
	}

	/**
	 * Inject perPage into event query block attributes so pagination context is correct.
	 *
	 * @access public
	 * @param array $parsed_block The parsed block data.
	 * @return array
	 */
	public function inject_event_query_per_page($parsed_block) {
		if ('core/query' !== ($parsed_block['blockName'] ?? '')) {
			return $parsed_block;
		}

		$namespace = $parsed_block['attrs']['namespace'] ?? '';

		if ('superstack/archive-event-past' === $namespace) {
			$parsed_block['attrs']['query']['perPage'] = (int) get_option('posts_per_page');
		} else if ('superstack/archive-event-upcoming' === $namespace) {
			$parsed_block['attrs']['query']['perPage'] = -1;
		}

		return $parsed_block;
	}

	/**
	 * Register event archive query variations.
	 *
	 * Handles:
	 * - superstack/archive-event-upcoming: upcoming events ordered by start_date ASC
	 * - superstack/archive-event-past: past events ordered by start_date DESC
	 * - superstack/upcoming-events: upcoming events ordered by start_date ASC
	 *
	 * @access public
	 * @param string|null $pre_render   The pre-rendered content.
	 * @param array       $parsed_block The block being rendered.
	 * @param array       $parent_block The parent block.
	 * @return null
	 */
	public function register_event_queries($pre_render, $parsed_block, $parent_block) {
		if ('core/query' !== ($parsed_block['blockName'] ?? '')) {
			return $pre_render;
		}

		$namespace = $parsed_block['attrs']['namespace'] ?? '';

		if (! in_array($namespace, ['superstack/archive-event-upcoming', 'superstack/archive-event-past', 'superstack/upcoming-events'], true)) {
			return $pre_render;
		}

		self::$current_event_namespace = $namespace;

		add_filter('query_loop_block_query_vars', [$this, 'modify_event_query_vars'], 99, 2);
		add_filter('render_block_core/query', [$this, 'cleanup_event_query_filter'], 10, 2);

		return $pre_render;
	}

	/**
	 * Modify query vars for event queries.
	 *
	 * @access public
	 * @param array    $query The query vars.
	 * @param WP_Block $block The block instance.
	 * @return array
	 */
	public function modify_event_query_vars($query, $block) {
		if (null === self::$current_event_namespace) {
			return $query;
		}

		$is_archive  = in_array(self::$current_event_namespace, ['superstack/archive-event-upcoming', 'superstack/archive-event-past'], true);
		$is_upcoming = in_array(self::$current_event_namespace, ['superstack/archive-event-upcoming', 'superstack/upcoming-events'], true);
		$now         = current_time('Y-m-d H:i:s');

		if ($is_archive) {
			$per_page                = $is_upcoming ? -1 : (int) get_option('posts_per_page');
			$original_per_page       = $block->context['query']['perPage'] ?? $per_page;
			$query['posts_per_page'] = $per_page;

			if (! $is_upcoming && $per_page > 0 && $original_per_page > 0) {
				$page            = (int) floor($query['offset'] / $original_per_page) + 1;
				$query['offset'] = ($page - 1) * $per_page;
			}
		} else {
			$query['post__not_in'][] = get_the_ID();
		}

		$query['post_type']  = 'event';
		$query['meta_key']   = 'event_start_date';
		$query['orderby']    = 'meta_value';
		$query['order']      = $is_upcoming ? 'ASC' : 'DESC';
		$query['meta_query'] = [
			[
				'key'     => 'event_start_date',
				'value'   => $now,
				'compare' => $is_upcoming ? '>=' : '<',
				'type'    => 'DATETIME',
			],
		];

		return $query;
	}

	/**
	 * Clean up event query filter after the core/query block has finished rendering.
	 *
	 * @access public
	 * @param string $block_content The block content.
	 * @param array  $block         The block attributes.
	 * @return string
	 */
	public function cleanup_event_query_filter($block_content, $block) {
		remove_filter('query_loop_block_query_vars', [$this, 'modify_event_query_vars'], 99);
		remove_filter('render_block_core/query', [$this, 'cleanup_event_query_filter'], 10);
		self::$current_event_namespace = null;

		return $block_content;
	}
}

Query_Archive_Event::get_instance()->init();
