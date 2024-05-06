<?php

namespace SUPT\Types;

abstract class TypeWithArchive extends Type {

	// const SETTING_PER_PAGE = '';
	// const SETTING_ARCHIVE_PAGE = '';
	// const GRAPHQL_ARCHIVE_FIELD_NAME = '';

	abstract function getSettingPerPage();
	abstract function getSettingArchivePage();

	abstract function get_per_page_setting_title();
	abstract function get_archive_page_setting_title();
	abstract function get_archive_page_state_title();

	function __construct() {
		parent::__construct();

		add_action( 'rest_api_init', [$this, 'register_archive_settings'] );
		add_action( 'admin_init', [$this, 'register_admin_archive_settings'] );
		add_action( 'init', [ $this, 'customize_permastruct' ] );

		add_filter( 'spck_graphql_archive_page_field_resolver', [$this, 'graphql_archive_page_field_resolver'], 10, 3 );

		add_filter( 'display_post_states', [$this, 'display_post_states'], 10, 2 );

		add_filter( $this->getName() . '_rewrite_rules', [$this, 'archive_paged_rewrite'] );
	}

	function get_per_page() {
		return intval(get_option( $this->getSettingPerPage(), 10 ));
	}

	function is_archive_page($page) {
		$page_id = $this->get_id($page);
		$page_lang = function_exists('pll_get_post_language') ? pll_get_post_language($this->get_id($page_id) ) : null;
		$is_archive_page = $page_id === $this->get_archive_page_id($page_lang);
		return $is_archive_page;
	}

	function get_archive_page_url( $lang = null ) {
		$page_id = $this->get_archive_page_id( $lang );
		return wp_make_link_relative( get_permalink( $page_id ) );
	}

	protected function get_archive_page_id( $lang = null ) {
		$archive_page_id = (int)get_option($this->getSettingArchivePage(), false);

		return ( (!empty( $lang ) && function_exists( 'SUPT\StarterpackI18n\get_localized_post_id' ))
			?  \SUPT\StarterpackI18n\get_localized_post_id($archive_page_id, $lang)
			: $archive_page_id
		);
	}

	/**
	 * Register settings related to this CPT
	 */
	function register_archive_settings() {
		register_setting(
			'reading',
			$this->getSettingArchivePage(),
			[
				'type'         => 'integer',
				'capability'   => 'manage_options',
				'show_in_rest' => true,
			]
		);
		register_setting(
			'reading',
			$this->getSettingPerPage(),
			[
				'type'         => 'integer',
				'capability'   => 'manage_options',
				'show_in_rest' => true,
				'default'      => 10,
			]
		);
	}

	function register_admin_archive_settings() {
		$this->register_archive_settings();

		// READING section
		add_settings_section(
			'listing_pages',
			_x( 'Listing pages', 'Reading settings', 'supt' ),
			function() {
				printf( '<p class="description">%s</p>', _x('Select the pages that will list different types of content.', 'Archive page settings', 'supt') );
			},
			'reading'
		);

		// READING fields
		add_settings_field(
			$this->getSettingArchivePage() .'_field',
			$this->get_archive_page_setting_title(),
			function( $args ) {
				wp_dropdown_pages( array(
					'name'              => $args['name'],
					'echo'              => true,
					'show_option_none'  => __( '&mdash; Select &mdash;' ),
					'option_none_value' => '0',
					'selected'          => get_option($args['name']),
				) );
			},
			'reading',
			'listing_pages',
			[ 'name' => $this->getSettingArchivePage() ]
		);
		add_settings_field(
			$this->getSettingPerPage() .'_field',
			$this->get_per_page_setting_title(),
			function( $args ) {
				printf(
					'<input type="number" id="%1$s" name="%2$s" placeholder="%3$s" value="%4$s" /><p class="description">%5$s</p>',
					$args['id'] ?? $args['name'],
					$this->getSettingPerPage(),
					'10',
					$this->get_per_page(),
					_x( 'Number of items to show in the archive page.', 'Archive page settings', 'supt' ),
				);
			},
			'reading',
			'listing_pages',
			[ 'name' => $this->getSettingArchivePage() ]
		);
	}

	function graphql_archive_page_field_resolver($archivePage, $source, $isTaxonomy = false) {
		if ( is_null($archivePage) && ($this->is_archive_page($source) || $isTaxonomy) ) {
			$archivePage = [
				'type'    => $this->getName(),
				'baseUri' => $this->get_archive_page_url( function_exists('pll_get_post_language') ? pll_get_post_language($this->get_id($source) ) : null ),
				'perPage' => $this->get_per_page(),
			];
		}

		return $archivePage;
	}

	/**
	 * Show "Post Type archive page" status next to the page title in the edit table
	 *
	 * @param string[] $post_states An array of post display states.
	 * @param WP_Post  $post        The current post object.
	 */
	function display_post_states($post_states, $post) {
		if ($this->is_archive_page($post->ID) ) {
			$post_states[$this->getName()] = $this->get_archive_page_state_title();
		}

		return $post_states;
	}

	/**
	 * Prepend the archive_name before CPT uri to the permastruct
	 * (Note: using wp native `rewrite` + `with_front` doesn't work as soon as we're adding a custom link prefix to the permalinks for the blog)
	 */
	function customize_permastruct() {
		global $post_types;

		$cpt_name = $this->getName();

		if(!isset($post_types) || $cpt_name === 'post') return; // Bail early if $post_types isn't defined or if it's a post

		$archive_link = $post_types[$this->getName()]->get_archive_page_url();

		add_permastruct($cpt_name, $archive_link .'%'.$this->getName().'%', array('with_front' => false) );
	}


	/**
	 * Add a custom rule for the pagination of CPT
	 */
	function archive_paged_rewrite($rules) {
		$cpt_name = $this->getName();

		if($cpt_name === 'post') return $rules; // Bail early if it's a post (as the pagination rules already exist)

		$rule = array_filter($rules, function($regex) {
			return strpos( $regex, '([^/]+)/page' ) > -1;
		}, ARRAY_FILTER_USE_KEY);

		if ( empty($rule) ) return $rules;

		$new_regex = str_replace( '([^/]+)/page/', 'page/', array_keys($rule)[0] );
		$new_regex = str_replace( '?:', '', $new_regex );

		$archive_link = $this->get_archive_page_url();

		$new_rules = array_merge([
			$new_regex => 'index.php?pagename='.str_replace('/','',$archive_link).'&paged=$matches[1]',
		], $rules);

		return $new_rules;
	}
}

