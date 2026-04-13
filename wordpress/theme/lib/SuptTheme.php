<?php

use function SUPT\get_next_url;
use function SUPT\get_remote_json;

const VITE_PORT = 3500;

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
		add_theme_support( 'disable-custom-font-sizes' );
		add_theme_support( 'disable-custom-gradients' );
		add_theme_support( 'editor-color-palette', [] );
		add_theme_support( 'editor-font-sizes', [] );
		add_theme_support( 'editor-gradient-presets', [] );
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
		add_action( 'enqueue_block_assets',	[$this, 'enqueue_editor_assets'] );

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
		$vite_origin = sprintf( 'http%s://host.docker.internal:%d', ( is_ssl() ? 's' : '' ), VITE_PORT );

		// In dev mode
		// -> check if Vite dev server is running by requesting its client endpoint
		if ( WP_DEBUG ) {
			$response = wp_remote_get( $vite_origin . '/@vite/client', [ 'timeout' => 1 ] );
			if ( ! is_wp_error( $response ) && 200 === wp_remote_retrieve_response_code( $response ) ) {
				// Vite dev server is running: serve scripts directly from the dev server.
				// CSS is injected at runtime by the module scripts – no separate stylesheet needed.
				$this->assets['vite_dev']      = true;
				$this->assets['vite_origin']   = $vite_origin;
				$this->assets['editor']['js']  = $vite_origin . '/theme/lib/editor/_loader.ts';
				$this->assets['admin']['js']   = $vite_origin . '/theme/lib/admin/_loader.ts';
				return;
			}
		}

		// Not in dev mode
		// OR Vite dev server is not running
		// -> try to load from the filesystem  [/wp-content/themes/superstack/static/.vite/manifest.json]
		$manifest_path = THEME_PATH . '/static/.vite/manifest.json';
		if ( ! file_exists( $manifest_path ) ) {
			wp_die( 'Please build the theme assets (run <code>npm run build</code> in the wordpress/ directory).' );
		}

		$manifest   = json_decode( file_get_contents( $manifest_path ) );
		$assets_uri = THEME_URI . '/static';

		// Vite manifest format (v5+):
		// { "theme/lib/editor/_loader.ts": { "file": "editor.hash.js", "css": ["editor.hash.css"] } }
		$editor_entry = $manifest->{'theme/lib/editor/_loader.ts'} ?? null;
		$admin_entry  = $manifest->{'theme/lib/admin/_loader.ts'}  ?? null;

		$this->assets['editor']['css'] = ! empty( $editor_entry->css[0] ) ? $assets_uri . '/' . $editor_entry->css[0] : null;
		$this->assets['editor']['js']  = ! empty( $editor_entry->file )   ? $assets_uri . '/' . $editor_entry->file   : null;
		$this->assets['admin']['css']  = ! empty( $admin_entry->css[0] )  ? $assets_uri . '/' . $admin_entry->css[0]  : null;
		$this->assets['admin']['js']   = ! empty( $admin_entry->file )    ? $assets_uri . '/' . $admin_entry->file    : null;
	}

	function enqueue_admin_assets() {
		if ( ! empty( $this->assets['admin']['css'] ) ) {
			wp_enqueue_style( 'supt-admin-style', $this->assets['admin']['css'], false, null );
		}

		if ( ! empty( $this->assets['admin']['js'] ) ) {
			// In dev mode also enqueue the Vite HMR client
			if ( ! empty( $this->assets['vite_dev'] ) ) {
				wp_enqueue_script( 'vite-client', $this->assets['vite_origin'] . '/@vite/client', [], null, false );
				add_filter( 'script_loader_tag', [ $this, 'add_module_type_to_vite_scripts' ], 10, 2 );
			}
			wp_enqueue_script( 'supt-admin-js', $this->assets['admin']['js'], [], null, false );
		}
	}

	function enqueue_editor_assets() {
		// Styles (production only – in dev mode CSS is injected by the module script)
		if ( ! empty( $this->assets['editor']['css'] ) ) {
			$style_deps = apply_filters( 'supt-style-deps', [ 'wp-editor' ] );
			wp_enqueue_style( 'supt-editor-style', $this->assets['editor']['css'], $style_deps, null );
		}

		// Scripts
		if ( ! empty( $this->assets['editor']['js'] ) ) {
			// In dev mode also enqueue the Vite HMR client
			if ( ! empty( $this->assets['vite_dev'] ) ) {
				wp_enqueue_script( 'vite-client', $this->assets['vite_origin'] . '/@vite/client', [], null, false );
				add_filter( 'script_loader_tag', [ $this, 'add_module_type_to_vite_scripts' ], 10, 2 );
			}

			$script_deps = apply_filters( 'supt-script-deps', [
				'wp-editor', 'wp-blocks', 'wp-dom-ready', 'wp-edit-post',
				'wp-hooks', 'wp-components', 'wp-blocks', 'wp-element',
				'wp-data', 'wp-date', 'wp-i18n', 'wp-api-fetch', 'wp-core-data'
			] );

			$localized_script = apply_filters( 'supt-localize-script', [ 'theme_uri' => THEME_URI ] );

			wp_register_script( 'supt-editor-script', $this->assets['editor']['js'], $script_deps, null, true );
			wp_localize_script( 'supt-editor-script', 'supt', $localized_script );
			wp_enqueue_script( 'supt-editor-script' );

			wp_set_script_translations( 'supt-editor-script', 'supt', THEME_PATH . '/languages' );
		}
	}

	/**
	 * Add type="module" to Vite-generated script tags so the browser
	 * can handle ES module imports (including HMR in dev mode).
	 */
	function add_module_type_to_vite_scripts( $tag, $handle ) {
		$module_handles = [ 'vite-client', 'supt-editor-script', 'supt-admin-js' ];
		if ( ! in_array( $handle, $module_handles, true ) ) {
			return $tag;
		}
		// Replace the opening <script> tag to add type="module"
		return preg_replace( '/(<script\b[^>]*?)(?:\btype=["\'][^"\']*["\'])?(.*?>)/i', '$1 type="module"$2', $tag, 1 );
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
