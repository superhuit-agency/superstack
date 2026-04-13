<?php

namespace Superstack\Admin\Editor;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}


/**
 * Class used to unregister core patterns & parent theme patterns.
 *
 * @package    Superstack
 * @subpackage Superstack/Admin/Editor
 * @author     Superhuit <tech@superhuit.ch>
 */
class Unregister_Default_Patterns {

	use Singleton;

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_action('after_setup_theme', [$this, 'remove_core_patterns']);
	}

	/**
	 * Remove core patterns.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @return   void
	 */
	public function remove_core_patterns() {
		remove_theme_support('core-block-patterns');
	}
}

Unregister_Default_Patterns::get_instance()->init();
