<?php

namespace Superstack\Admin\Editor;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Class used to register custom block pattern categories.
 *
 * @package    Superstack
 * @subpackage Superstack/Admin/Editor
 * @author     Superhuit <tech@superhuit.ch>
 * @since      1.0.0
 */
class Register_Pattern_Categories {

	use Singleton;

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_action('init', [$this, 'register_categories'], 9);
	}

	/**
	 * Register custom pattern categories.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @return   void
	 */
	public function register_categories() {
		$categories = [
			'heros' => [
				'label'       => _x('Heros', 'Block pattern category', SUPERSTACK_THEME_NAME),
				'description' => __('Hero sections.', SUPERSTACK_THEME_NAME),
			],
			'cards' => [
				'label'       => _x('Cards', 'Block pattern category', SUPERSTACK_THEME_NAME),
				'description' => __('Card patterns.', SUPERSTACK_THEME_NAME),
			],
		];

		foreach ($categories as $slug => $args) {
			register_block_pattern_category($slug, $args);
		}
	}
}

Register_Pattern_Categories::get_instance()->init();
