<?php

namespace Superstack\Admin\Editor;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Class used to register custom block categories.
 *
 * @package    Superstack
 * @subpackage Superstack/Admin/Editor
 * @author     Superhuit <tech@superhuit.ch>
 * @since      1.0.0
 */
class Register_Block_Categories {

	use Singleton;

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_filter('block_categories_all', [$this, 'register_custom_category'], 10, 2);
	}

	/**
	 * Register the "custom" block category.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @param    array                   $categories Block categories.
	 * @param    \WP_Block_Editor_Context $context    Block editor context.
	 * @return   array
	 */
	public function register_custom_category($categories, $context) {
		return array_merge(
			[
				[
					'slug'  => 'superstack',
					'title' => _x('Superstack', 'block category', SUPERSTACK_THEME_NAME),
					'icon'  => null,
				],
			],
			$categories,
		);
	}
}

Register_Block_Categories::get_instance()->init();
