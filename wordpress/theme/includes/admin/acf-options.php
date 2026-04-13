<?php

namespace Superstack\Admin;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Registers ACF options pages and their field groups.
 *
 * @package    Superstack
 * @subpackage Superstack/Admin
 * @author     Superhuit <tech@superhuit.ch>
 * @since      1.0.0
 */
class Acf_Options {

	use Singleton;

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_action('acf/init', [$this, 'register_options_pages']);
		add_action('acf/include_fields', [$this, 'register_field_groups']);
	}

	/**
	 * Register ACF options pages.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @return   void
	 */
	public function register_options_pages() {
		if (! function_exists('acf_add_options_page')) {
			return;
		}

		acf_add_options_page([
			'page_title' => __('Custom Settings', SUPERSTACK_THEME_NAME),
			'menu_title' => __('Custom Settings', SUPERSTACK_THEME_NAME),
			'menu_slug'  => 'custom-settings',
			'capability' => 'manage_options',
			'parent'     => 'options-general.php',
			'position'   => 100,
		]);
	}

	/**
	 * Register ACF field groups.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @return   void
	 */
	public function register_field_groups() {
		if (! function_exists('acf_add_local_field_group')) {
			return;
		}

		acf_add_local_field_group([
			'key'      => 'group_custom_settings',
			'title'    => __('Custom Settings', SUPERSTACK_THEME_NAME),
			'fields'   => [
				[
					'key'          => 'field_google_maps_api_key',
					'label'        => __('Google Maps API Key', SUPERSTACK_THEME_NAME),
					'name'         => 'google_maps_api_key',
					'type'         => 'text',
					'required'     => 0,
					'instructions' => __('Enter your Google Maps API key.', SUPERSTACK_THEME_NAME),
				],
			],
			'location' => [
				[
					[
						'param'    => 'options_page',
						'operator' => '==',
						'value'    => 'custom-settings',
					],
				],
			],
		]);
	}
}

Acf_Options::get_instance()->init();
