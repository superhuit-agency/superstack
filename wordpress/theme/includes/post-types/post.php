<?php

namespace Superstack\Post_Types;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Post display customizations.
 *
 * @package    Superstack
 * @subpackage Superstack/Post_Types
 * @since      1.0.0
 */
class Post {

	use Singleton;

	/**
	 * Excluded category slug from single post terms output.
	 *
	 * @var string
	 */
	const EXCLUDED_CATEGORY_SLUG = 'uncategorized';

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_filter('render_block_core/post-terms', [$this, 'filter_single_post_terms'], 10, 3);
	}

	/**
	 * Remove "uncategorized" from category terms on single post view.
	 *
	 * @access public
	 * @param  string    $block_content The block content.
	 * @param  array     $block         The block attributes.
	 * @param  \WP_Block $instance      The block instance.
	 * @return string
	 */
	public function filter_single_post_terms($block_content, $block, $instance) {
		if (! is_singular('post')) {
			return $block_content;
		}

		if ('category' !== ($block['attrs']['term'] ?? 'category')) {
			return $block_content;
		}

		$post_id = $instance->context['postId'] ?? get_the_ID();

		if (empty($post_id)) {
			return $block_content;
		}

		$terms = get_the_terms($post_id, 'category');

		if (empty($terms) || is_wp_error($terms)) {
			return $block_content;
		}

		$filtered_terms = array_values(
			array_filter(
				$terms,
				fn($term) => self::EXCLUDED_CATEGORY_SLUG !== $term->slug
			)
		);

		if (empty($filtered_terms)) {
			return '';
		}

		$links = array_map(
			fn($term) => sprintf(
				'<a href="%s" rel="tag">%s</a>',
				esc_url(get_term_link($term)),
				esc_html($term->name)
			),
			$filtered_terms
		);

		$separator   = $block['attrs']['separator'] ?? ', ';
		$class_names = ['wp-block-post-terms'];

		if (! empty($block['attrs']['className'])) {
			$extra_classes = preg_split('/\s+/', trim((string) $block['attrs']['className']));
			$extra_classes = array_filter($extra_classes);
			$extra_classes = array_map('sanitize_html_class', $extra_classes);
			$class_names   = array_merge($class_names, $extra_classes);
		}

		return sprintf(
			'<div class="%1$s">%2$s%3$s%4$s</div>',
			esc_attr(implode(' ', $class_names)),
			esc_html($block['attrs']['prefix'] ?? ''),
			implode(wp_kses_post($separator), $links),
			esc_html($block['attrs']['suffix'] ?? '')
		);
	}
}

Post::get_instance()->init();
