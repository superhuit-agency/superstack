<?php

namespace Superstack\Admin;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Moves Content Control settings page from Settings to Tools menu
 * and lowers the required capability so editors can access it.
 *
 * @package    Superstack
 * @subpackage Superstack/Admin
 * @since      1.0.0
 */
class Content_Control_Menu {

	use Singleton;

	const MENU_SLUG = 'content-control-settings';
	const CAPABILITY = 'manage_content_control_restriction';

	/**
	 * @access public
	 * @return void
	 */
	public function init() {
		add_action('admin_menu', [$this, 'relocate_menu'], 1000);
		add_action('admin_enqueue_scripts', [$this, 'enqueue_scripts']);
		add_filter('content_control/plugin_action_links', [$this, 'fix_action_links']);
	}

	/**
	 * Remove from Settings, re-add under Tools.
	 *
	 * @access public
	 * @return void
	 */
	public function relocate_menu() {
		remove_submenu_page('options-general.php', self::MENU_SLUG);

		add_management_page(
			__('Content Control', 'content-control'),
			__('Content Control', 'content-control'),
			self::CAPABILITY,
			self::MENU_SLUG,
			[$this, 'render_page']
		);
	}

	/**
	 * Render the settings page container.
	 * Mirrors the plugin's own render_page() output.
	 *
	 * @access public
	 * @return void
	 */
	public function render_page() {
		?>
		<div id="content-control-root-container"></div>
		<script>jQuery(() => window.contentControl.settingsPage.init());</script>
		<?php
	}

	/**
	 * Point the "Settings" action link to the new Tools page URL.
	 *
	 * @access public
	 * @param  array<string,string> $links Plugin action links.
	 * @return array<string,string>
	 */
	public function fix_action_links($links) {
		$links['settings'] = '<a href="' . admin_url('tools.php?page=' . self::MENU_SLUG) . '">'
			. __('Settings', 'content-control') . '</a>';

		return $links;
	}

	/**
	 * Enqueue Content Control assets on the relocated Tools page.
	 * The plugin only enqueues on its original settings_page_ hook suffix.
	 *
	 * @access public
	 * @param  string $hook Current admin page hook suffix.
	 * @return void
	 */
	public function enqueue_scripts($hook) {
		if ('tools_page_' . self::MENU_SLUG !== $hook) {
			return;
		}

		wp_enqueue_editor();
		wp_tinymce_inline_scripts();
		wp_enqueue_script('content-control-settings-page');
	}
}

Content_Control_Menu::get_instance()->init();
