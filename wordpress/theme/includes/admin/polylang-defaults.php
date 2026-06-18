<?php

namespace Superstack\Admin;

add_action('init', __NAMESPACE__ . '\set_polylang_defaults');

function set_polylang_defaults() {
	// do nothing if polylang is not activated
	if (!function_exists('pll_languages_list')) {
		return;
	}

	global $polylang;
	if (!isset($polylang)) {
		return;
	}

	// set default languages
	// ONLY IF none is set yet
	// note: this is to avoid annoying errors when we first setup a site
	if (empty(pll_languages_list())) {
		// hint: see add_language function definition at https://github.com/polylang/polylang/blob/master/admin/admin-model.php#L10-L30
		$polylang->model->add_language(['name' => 'English', 'slug' => 'en', 'locale' => 'en_US']);
		$polylang->model->add_language(['name' => 'Français', 'slug' => 'fr', 'locale' => 'fr_FR']);
	}

	// override/enforce a few polylang configs
	// $polylang->options is a WP_Syntex\Polylang\Options\Options object (since Polylang 3.7)
	// it auto-saves to the database on shutdown
	$polylang->options['browser'] = false;        // Detect browser language
	$polylang->options['hide_default'] = false;   // Hide URL language information for default language
	$polylang->options['redirect_lang'] = true;   // The front page url contains the language code instead of the page name or page id

	if (empty($polylang->options['default_lang'])) {
		$langs = pll_languages_list();
		if (!empty($langs)) {
			$polylang->options['default_lang'] = $langs[0];
		}
	}

	// Assign all unassigned public posts/pages to the default language.
	// This handles content that existed before Polylang was activated.
	$default_lang = $polylang->options['default_lang'];
	if (!empty($default_lang)) {
		$post_types = array_values(get_post_types(['public' => true]));
		$posts = get_posts([
			'post_type'      => $post_types,
			'posts_per_page' => -1,
			'post_status'    => 'any',
			'fields'         => 'ids',
		]);
		foreach ($posts as $post_id) {
			if (!pll_get_post_language($post_id)) {
				pll_set_post_language($post_id, $default_lang);
			}
		}
	}
}
