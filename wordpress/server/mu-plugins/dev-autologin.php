<?php
/**
 * Plugin Name: Dev Auto-Login
 * Description: Local-only helper. Visiting /?dev_autologin=<secret> logs you in as an administrator. Only active when the DEV_AUTOLOGIN_SECRET environment variable is set (local docker-compose), so it can never run on a real server.
 */

add_action('init', function () {
	$secret = getenv('DEV_AUTOLOGIN_SECRET');

	if (empty($secret) || !isset($_GET['dev_autologin'])) {
		return;
	}

	if (!hash_equals($secret, (string) $_GET['dev_autologin'])) {
		return;
	}

	if (!is_user_logged_in()) {
		$admins = get_users([
			'role'    => 'administrator',
			'number'  => 1,
			'orderby' => 'ID',
			'order'   => 'ASC',
		]);

		if (empty($admins)) {
			return;
		}

		wp_set_current_user($admins[0]->ID);
		wp_set_auth_cookie($admins[0]->ID);
	}

	wp_safe_redirect(admin_url());
	exit;
});
