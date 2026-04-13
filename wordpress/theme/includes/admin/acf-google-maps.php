<?php

namespace Superstack\Admin;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Configures ACF Google Maps integration.
 *
 * @package    Superstack
 * @subpackage Superstack/Admin
 * @author     Superhuit <tech@superhuit.ch>
 * @since      1.0.0
 */
class Acf_Google_Maps {

	use Singleton;

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_action('acf/init', [$this, 'register_api_key']);
	}

	/**
	 * Register the Google Maps API key with ACF.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @return   void
	 */
	public function register_api_key() {
		$api_key = get_field('google_maps_api_key', 'option');

		if ($api_key) {
			acf_update_setting('google_api_key', $api_key);
		}
	}
}

Acf_Google_Maps::get_instance()->init();
