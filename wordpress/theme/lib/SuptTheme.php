<?php

use function SUPT\get_next_url;
use function SUPT\get_remote_json;

const WEBPACK_PORT = 3500;

class SuptTheme {

	/**
	 * @var array
	 */
	private $assets = [
		'admin'  => [],
		'editor' => [],
	];

	function __construct() {
		// Theme supports
		// -> more info: https://developer.wordpress.org/reference/functions/add_theme_support/
		add_theme_support( 'custom-logo', [ 'width' => 400, 'height' => 200, 'flex-width' => true ]);
		add_theme_support( 'menus' );
		add_theme_support( 'editor-styles' );

		/**
		 * Filters the post types to support Feature Images (post thumbnail).
		 * Must be attached before `setup_theme` hook
		 *
		 * @since 2.1.0
		 *
		 * @param array $post_types The supported post types. Default: [ 'post' ]
		 */
		add_theme_support( 'post-thumbnails', apply_filters('supt_theme_thumbnail_support', [ 'post' ] ) );

		// Disable some theme features
		add_theme_support( 'disable-custom-colors' );
		add_theme_support( 'editor-color-palette', [] );
		add_theme_support( 'editor-font-sizes', [] );
		add_theme_support( 'disable-custom-font-sizes' );
		add_theme_support( 'disable-drop-cap' ); // this does not seems to work
		add_theme_support( 'disable-font-sizes' ); // this does not seems to work
		remove_theme_support( 'core-block-patterns' );

		// Filters
		// -> more info: https://developer.wordpress.org/reference/functions/add_filter/
		add_filter( 'graphql_jwt_auth_secret_key', [$this, 'graphql_jwt_auth_secret_key'] );
		add_filter( 'graphql_jwt_auth_expire', [$this, 'graphql_jwt_auth_expire'], 10 );
		add_filter( 'i_order_terms_taxonomies', [$this, 'i_order_terms_taxonomies'] );

		add_filter( 'spckforms_site_url', 'SUPT\get_next_url' );

		// Actions
		// -> more info: https://developer.wordpress.org/reference/functions/add_action/
		add_action( 'init', [$this, 'register_menu_locations'] );
		add_action( 'init', [$this, 'register_assets'] );
		add_action( 'admin_enqueue_scripts', [$this, 'enqueue_admin_assets'] );
		add_action( 'enqueue_block_editor_assets',	[$this, 'enqueue_editor_assets'] );
		add_action( 'after_setup_theme', [$this, 'disable_gutenberg_color_settings'] );

		add_filter( 'wp_is_application_passwords_available', [$this, 'wp_is_application_passwords_available'] );

		// Fix CORS
		add_action( 'rest_api_init', function() {
			remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
			add_filter( 'rest_pre_serve_request', [$this, 'initCors'] );
		}, 15 );

		// Disable downloadable blocks from the block inserter
		remove_action( 'enqueue_block_editor_assets', 'wp_enqueue_editor_block_directory_assets' );

		// Load translation texts
		add_action( 'after_setup_theme', [$this, 'load_textdomain'] );
	}

	function graphql_jwt_auth_secret_key() {
		return ! empty($_ENV['GRAPHQL_JWT_AUTH_SECRET_KEY'])
		       ? $_ENV['GRAPHQL_JWT_AUTH_SECRET_KEY']
		       : '?lPaVLgHvdg9LwSCQjz2-7i pc_9s]74^pWO.i]|5XxlcjxxN!L]w<L(sM2]~}z?';
	}

	function graphql_jwt_auth_expire( $expiration ) {
		return 300; // default: 300
	}

	function load_textdomain() {
		load_theme_textdomain( 'supt', THEME_PATH . '/languages' );
	}

	function register_menu_locations() {
		register_nav_menus(
			array(
				'header' 	 	=> __( 'Header Primary', 'supt' ),
				'footer' 		=> __( 'Footer', 'supt' ),
				'legal'  		=> __( 'Legal', 'supt' ),
				'social'		=> __( 'Social', 'supt' ),
			)
		);
	}

	/**
	 * define which taxonomies are sortable in wordpress dashboard
	 */
	function i_order_terms_taxonomies( $taxonomies ) {
		if (empty($taxonomies)) $taxonomies = [];
		$taxonomies[] = 'category';
		$taxonomies[] = 'post_tag';
		return $taxonomies;
	}

	function register_assets() {
		// vars
		$manifest = null;
		$assets_uri = '';

		// In dev mode
		// -> try to load assets from webpack-dev-server
		if ( WP_DEBUG && $manifest = get_remote_json( sprintf('http%s://host.docker.internal:%d/manifest.json', (is_ssl() ? 's':''), WEBPACK_PORT) ) ) {
			$assets_uri = "";
		}

		// Not in dev mode
		// OR webpack-dev-server is not running
		// -> try to load from the filesystem  [/wp-content/themes/superstack/static/manifest.json]
		elseif ( file_exists(THEME_PATH . '/static/manifest.json') && $manifest = json_decode(file_get_contents(THEME_PATH . '/static/manifest.json', true)) ) {
			$assets_uri = THEME_URI . '/static/';
		}

		// Manifest not found…
		// -> bail
		else {
			wp_die('Please build the theme with webpack (manifest.json cannot be found).');
		}

		$this->assets['editor']['css'] = !empty($manifest->{'editor.css'}) ? $assets_uri . $manifest->{'editor.css'} : null;
		$this->assets['editor']['js']  = !empty($manifest->{'editor.js'})  ? $assets_uri . $manifest->{'editor.js'}  : null;
		$this->assets['admin']['css']  = !empty($manifest->{'admin.css'})  ? $assets_uri . $manifest->{'admin.css'}  : null;
		$this->assets['admin']['js']   = !empty($manifest->{'admin.js'})   ? $assets_uri . $manifest->{'admin.js'}   : null;
	}

	function enqueue_admin_assets() {
		if ( !empty($this->assets['admin']['css']) ) wp_enqueue_style( 'supt-admin-style', $this->assets['admin']['css'], false, null );
		if ( !empty($this->assets['admin']['js']) ) wp_enqueue_script( 'supt-admin-js', $this->assets['admin']['js'], false, null );
	}

	function enqueue_editor_assets() {
		// Styles
		if ( !empty($this->assets['editor']['css']) ) {
			$style_deps = apply_filters( 'supt-style-deps', [ 'wp-editor' ]);
			wp_enqueue_style( 'supt-editor-style', $this->assets['editor']['css'], $style_deps, null );
		}

		// Scripts
		if ( !empty($this->assets['editor']['js']) ) {
			$script_deps = apply_filters( 'supt-script-deps', [
				'wp-editor', 'wp-blocks', 'wp-dom-ready', 'wp-edit-post',
				'wp-hooks', 'wp-components', 'wp-blocks', 'wp-element',
				'wp-data', 'wp-date', 'wp-i18n', 'wp-api-fetch', 'wp-core-data'
			]);

			$localized_script = apply_filters( 'supt-localize-script', [ 'theme_uri' => THEME_URI ] );

			wp_register_script( 'supt-editor-script', $this->assets['editor']['js'], $script_deps, null, true );
			wp_localize_script( 'supt-editor-script', 'supt', $localized_script );
			wp_enqueue_script( 'supt-editor-script' );

			wp_set_script_translations('supt-editor-script', 'supt', THEME_PATH . '/languages');
		}
	}



	/**
	 * Remove default color settings in WP sidebar for core blocks
	 */
	function disable_gutenberg_color_settings() {
		add_theme_support( 'disable-custom-colors' );
		add_theme_support( 'disable-custom-colors' );
		add_theme_support( 'editor-color-palette' );
		add_theme_support( 'editor-gradient-presets', [] );
		add_theme_support( 'disable-custom-gradients' );
	}

	/**
	 * Enable cross-origin requests
	 * Note: same-origin requests are always allowed
	 * To learn more about CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
	 */
	function initCors($value) {
		$origin = get_http_origin();
		$allowed_origins = [ get_next_url() /*, 'your-domain.com'*/ ];

		if ( $origin && in_array( $origin, $allowed_origins ) ) {
			header( 'Access-Control-Allow-Origin: ' . esc_url_raw( $origin ) );
			header( 'Access-Control-Allow-Methods: GET' );
			header( 'Access-Control-Allow-Credentials: true' );
		}

		return $value;
	}

	/**
	 * Force application passwords to be available
	 * on dev instances, even if not SSL.
	 */
	function wp_is_application_passwords_available($available) {
		return WP_DEBUG ? true : $available;
	}
}
