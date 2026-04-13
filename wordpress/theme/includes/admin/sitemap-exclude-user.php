<?php

namespace Superstack\Admin;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

class Sitemap_Exclude_User {

	use Singleton;

	public function init() {
		add_filter('wp_sitemaps_add_provider', [$this, 'filter_wp_sitemaps_add_provider'], 10, 2);
	}

	public function filter_wp_sitemaps_add_provider($provider, $name) {
		if ('users' === $name) {
			return false;
		}
		return $provider;
	}
}

Sitemap_Exclude_User::get_instance()->init();
