<?php

namespace Superstack\Public;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * The public-facing functionality of the theme.
 *
 * @package    Superstack
 * @subpackage Superstack/Public
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
		add_action('wp_enqueue_scripts', [$this, 'enqueue_resources']);
	}

	/**
	 * Register the JavaScript and stylesheets for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_resources() {

		$unique_id = SUPERSTACK_THEME_NAME . '-public';

		/*Scripts dependency files*/
		$deps_file = SUPERSTACK_PATH . 'static/public/index.asset.php';

		if (file_exists($deps_file)) {
			/*Set dependency and version*/
			$deps_file  = require $deps_file;
			$dependency = $deps_file['dependencies'] ?? [];
			$version    = $deps_file['version'] ?? SUPERSTACK_VERSION;

			wp_enqueue_script($unique_id, SUPERSTACK_URL . 'static/public/index.js', $dependency, $version, true);
		}

		wp_enqueue_style($unique_id, SUPERSTACK_URL . 'static/public/index.css', [], SUPERSTACK_VERSION);
	}
}


Index::get_instance()->init();
