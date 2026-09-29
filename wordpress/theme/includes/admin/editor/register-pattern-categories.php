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
				'label'       => _x('Heros', 'Block pattern category', 'superstack'),
				'description' => __('Hero sections.', 'superstack'),
			],
			'cards' => [
				'label'       => _x('Cards', 'Block pattern category', 'superstack'),
				'description' => __('Card patterns.', 'superstack'),
			],
		];

		foreach ($categories as $slug => $args) {
			register_block_pattern_category($slug, $args);
		}
	}
}

Register_Pattern_Categories::get_instance()->init();
