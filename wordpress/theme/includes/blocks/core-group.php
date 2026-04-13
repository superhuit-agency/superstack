<?php

namespace Superstack\Blocks;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Core Group Block modifications.
 *
 * Adds a column count class to grid layout groups.
 *
 * @package    Superstack
 * @subpackage Superstack/Blocks
 * @since      1.0.0
 */
class Core_Group {

	use Singleton;

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_filter('render_block_core/group', [$this, 'add_grid_column_class'], 10, 2);
	}

	/**
	 * Add a column count class to core/group blocks with manual grid layout.
	 *
	 * @access public
	 * @param string $block_content The block content.
	 * @param array  $block         The full block, including name and attributes.
	 * @return string
	 */
	public function add_grid_column_class($block_content, $block) {
		$layout = $block['attrs']['layout'] ?? [];

		if ('grid' !== ($layout['type'] ?? '') || empty($layout['columnCount'])) {
			return $block_content;
		}

		$processor = new \WP_HTML_Tag_Processor($block_content);

		if ($processor->next_tag()) {
			$processor->add_class("has-{$layout['columnCount']}-columns");
		}

		return $processor->get_updated_html();
	}
}

Core_Group::get_instance()->init();
