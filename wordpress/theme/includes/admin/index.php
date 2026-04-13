<?php

namespace Superstack\Admin;

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
		add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
	}

	/**
	 * Register the assets for the admin.
	 *
	 * @since    1.0.0
	 * @return   void
	 */
	public function enqueue_admin_assets() {
		if (! is_admin()) {
			return;
		}

		$unique_id = SUPERSTACK_THEME_NAME . '-admin';

		/*Scripts dependency files*/
		$deps_file = SUPERSTACK_PATH . 'static/admin/admin.asset.php';

		if (file_exists($deps_file)) {
			/*Set dependency and version*/
			$deps_file  = require $deps_file;
			$dependency = $deps_file['dependencies'] ?? [];
			$version    = $deps_file['version'] ?? SUPERSTACK_VERSION;

			wp_enqueue_script($unique_id, SUPERSTACK_URL . 'static/admin/admin.js', $dependency, $version, true);
		}

		wp_enqueue_style($unique_id, SUPERSTACK_URL . 'static/admin/admin.css', [], SUPERSTACK_VERSION);
	}
}

Index::get_instance()->init();
