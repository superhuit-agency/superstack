<?php

namespace SUPT\Admin;

add_action( 'init', __NAMESPACE__ . '\set_polylang_defaults' );

function set_polylang_defaults() {
	// do nothing if polylang is not activated
	if (!function_exists('pll_languages_list')) {
		return;
	}

	// set default languages
	// ONLY IF none is set yet
	// note: this is to avoid annoying errors when we first setup a site
	if (empty(pll_languages_list())) {
		$config = get_option( 'polylang' );
		$model = new \PLL_Admin_Model( $config );
		// hint: see add_language function definition at https://github.com/polylang/polylang/blob/master/admin/admin-model.php#L10-L30
		$model->add_language([ 'name' => 'English', 'slug' => 'en', 'locale' => 'en_US' ]);
		$model->add_language([ 'name' => 'Français', 'slug' => 'fr', 'locale' => 'fr_FR' ]);
	}

	// override/enforce a few polylang configs
	$config = get_option( 'polylang' );
	$config = array_merge($config, [
		'browser' => false, // Detect browser language
		'hide_default' => false, // Hide URL language information for default language
		'redirect_lang' => true, // The front page url contains the language code instead of the page name or page id
		'default_lang' => $config['default_lang'] ? $config['default_lang'] : pll_languages_list()[0],
		'media' => [ 'duplicate' => 1 ] // Automatically duplicate media in all languages when uploading a new file
	]);
	update_option( 'polylang', $config );
}
