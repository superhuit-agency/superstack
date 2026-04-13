<?php

namespace Superstack\Admin\Editor;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * File for Block Editor.
 *
 * @package    Superstack
 * @subpackage Superstack/Admin/Editor
 * @author     Superhuit <tech@superhuit.ch>
 */
class Index {
	use Singleton;

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_action('enqueue_block_assets', [$this, 'enqueue_block_content_assets']);
		add_action('enqueue_block_editor_assets', [$this, 'enqueue_block_editor_assets']);
	}

	/**
	 * Register the assets for the block editor content (inside the iframe).
	 *
	 * @since    1.0.0
	 * @return   void
	 */
	public function enqueue_block_content_assets() {
		if (! is_admin()) {
			return;
		}

		$unique_id = SUPERSTACK_THEME_NAME . '-editor-content';

		/*Scripts dependency files*/
		$deps_file = SUPERSTACK_PATH . 'static/editor/editor-content.asset.php';

		if (file_exists($deps_file)) {
			/*Set dependency and version*/
			$deps_file  = require $deps_file;
			$dependency = $deps_file['dependencies'] ?? [];
			$version    = $deps_file['version'] ?? SUPERSTACK_VERSION;

			wp_enqueue_script($unique_id, SUPERSTACK_URL . 'static/editor/editor-content.js', $dependency, $version, true);
		}

		wp_enqueue_style($unique_id, SUPERSTACK_URL . 'static/editor/editor-content.css', [], SUPERSTACK_VERSION);
	}


	/**
	 * Register the assets for the block editor.
	 *
	 * @since    1.0.0
	 * @return   void
	 */
	public function enqueue_block_editor_assets() {

		$unique_id = SUPERSTACK_THEME_NAME . '-editor';

		/*Scripts dependency files*/
		$deps_file = SUPERSTACK_PATH . 'static/admin/editor.asset.php';


		if (file_exists($deps_file)) {
			/*Set dependency and version*/
			$deps_file  = require $deps_file;
			$dependency = $deps_file['dependencies'] ?? [];
			$version    = $deps_file['version'] ?? SUPERSTACK_VERSION;

			wp_enqueue_script($unique_id, SUPERSTACK_URL . 'static/admin/editor.js', $dependency, $version, true);
		}

		wp_enqueue_style($unique_id, SUPERSTACK_URL . 'static/admin/editor.css', [], SUPERSTACK_VERSION);
	}
}

Index::get_instance()->init();
