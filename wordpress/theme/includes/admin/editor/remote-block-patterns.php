<?php

namespace Superstack\Admin\Editor;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}


/**
 * Class used to avoid loading remote block patterns and block directory.
 *
 * @package    Superstack
 * @subpackage Superstack/Admin/Editor
 * @author     Superhuit <tech@superhuit.ch>
 */
class Remote_Block_Patterns {

	use Singleton;

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		// Disable remote block patterns from WordPress.org
		add_filter('should_load_remote_block_patterns', '__return_false');

		// Disable block directory (removes "Available to install" message)
		add_action('admin_init', [$this, 'disable_block_directory']);
		add_filter('block_editor_settings_all', [$this, 'disable_block_directory_settings'], 10, 2);
	}

	/**
	 * Remove block directory assets.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @return   void
	 */
	public function disable_block_directory() {
		remove_action('enqueue_block_editor_assets', 'wp_enqueue_editor_block_directory_assets');
	}

	/**
	 * Disable block directory via editor settings.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @param    array $settings Editor settings.
	 * @param    object $context Editor context.
	 * @return   array Modified settings.
	 */
	public function disable_block_directory_settings($settings, $context) {
		$settings['enableBlockDirectory'] = false;
		return $settings;
	}
}

Remote_Block_Patterns::get_instance()->init();
