<?php

namespace SUPT\Types;

use WPGraphQL\Model\Post as GraphQlPost;

use const Supt\Taxonomies\Tag\TAXONOMY_NAME as TAG_TAXONOMY_NAME;
use const Supt\Taxonomies\Category\TAXONOMY_NAME as CATEGORY_TAXONOMY_NAME;
use const SUPT\Types\Page\GRAPHQL_TYPE_NAME;

class Post extends TypeWithArchive {

	/**
	 * Constants
	 */
	const NAME = 'post';
	const GRAPHQL_TYPE_NAME = 'Post';
	const GRAPHQL_ARCHIVE_FIELD_NAME = 'posts';

	const SETTING_PER_PAGE     = 'supt_posts_per_page';
	const SETTING_ARCHIVE_PAGE = 'supt_page_for_posts';

	const SETTING_NB_RELATED_POSTS = 'nb_related_posts';
	const SETTING_RELATED_POSTS_BY_CAT = 'related_posts_by_cat';
	const SETTING_RELATED_POSTS_BY_TAG = 'related_posts_by_tag';

	/**
	 * Bind all you action & filter hooks in here.
	 */
	function __construct() {
		parent::__construct();

		add_action( 'admin_init', [$this, 'register_relatedposts_settings'] );
		add_action( 'graphql_register_types', [$this, 'graphql_register_reading_settings_fields'] );
		add_action( 'graphql_register_types', [$this, 'graphql_register_relatedposts_field'] );
	}

	function register() {
		// Built-in post-type. no need to re-register.
		// But you can for instance make the post-type non public or rename it.
	}

	function getName() { return self::NAME; }
	function getGraphQLTypeName() { return self::GRAPHQL_TYPE_NAME; }
	function getSettingPerPage() { return self::SETTING_PER_PAGE; }
	function getSettingArchivePage() { return self::SETTING_ARCHIVE_PAGE; }
	function getGraphQLArchiveFieldName() { return self::GRAPHQL_ARCHIVE_FIELD_NAME; }

	function get_per_page_setting_title() {
		return _x('Posts per page', 'Section reading settings', 'supt');
	}

	function get_archive_page_setting_title() {
		return _x('Posts archive page', 'Section reading settings', 'supt');
	}

	function get_archive_page_state_title() {
		return _x('🗞 Posts page', '', 'supt');
	}

	/**
	 * Register settings + fields for
	 * related posts options in READING WP settings
	 */
	function register_relatedposts_settings() {
		register_setting(
			'reading',
			self::SETTING_NB_RELATED_POSTS,
			[
				'type'         => 'integer',
				'capability'   => 'manage_options',
				'default'      => 3,
			]
		);
		register_setting(
			'reading',
			self::SETTING_RELATED_POSTS_BY_CAT,
			[
				'type'         => 'boolean',
				'capability'   => 'manage_options',
				'default'      => true,
			]
		);
		register_setting(
			'reading',
			self::SETTING_RELATED_POSTS_BY_TAG,
			[
				'type'         => 'boolean',
				'capability'   => 'manage_options',
				'default'      => false,
			]
		);

		$section_id = 'settings_section_relatedposts';

		// READING section
		add_settings_section(
			$section_id,
			_x( 'Related posts', 'Reading settings', 'supt' ),
			function() {
				printf( '<p class="description">%s</p>', _x('Configure related posts shown at the bottom of a single post page.', 'Related posts settings', 'supt') );
			},
			'reading'
		);

		add_settings_field(
			self::SETTING_NB_RELATED_POSTS .'_field',
			_x( 'Nb related posts:', 'Related posts settings', 'supt' ),
			'SUPT\SettingsFields\render_field_text',
			'reading',
			$section_id,
			[
				'name'  => self::SETTING_NB_RELATED_POSTS,
				'type'  => 'number',
				'value' => get_option(self::SETTING_NB_RELATED_POSTS),
				'help'  => _x( 'Number of posts to show.', 'Related posts settings', 'supt' ),
			]
		);
		add_settings_field(
			self::SETTING_RELATED_POSTS_BY_CAT .'_field',
			_x( 'Relate by category:', 'Related posts settings', 'supt' ),
			'SUPT\SettingsFields\render_switch_field',
			'reading',
			$section_id,
			[
				'name'    => self::SETTING_RELATED_POSTS_BY_CAT,
				'checked' => get_option(self::SETTING_RELATED_POSTS_BY_CAT),
				'help'    => _x( 'Should be related by categories?', 'Related posts settings', 'supt' ),
			]
		);
		add_settings_field(
			self::SETTING_RELATED_POSTS_BY_TAG .'_field',
			_x( 'Relate by tags:', 'Related posts settings', 'supt' ),
			'SUPT\SettingsFields\render_switch_field',
			'reading',
			$section_id,
			[
				'name'    => self::SETTING_RELATED_POSTS_BY_TAG,
				'checked' => get_option(self::SETTING_RELATED_POSTS_BY_TAG),
				'help'    => _x( 'Should be related by tags?', 'Related posts settings', 'supt' ),
			]
		);
	}

	function graphql_register_reading_settings_fields() {
		register_graphql_field( 'ReadingSettings', 'postsPage', [
			'type'        => Page::GRAPHQL_TYPE_NAME,
			'description' => _x('Page for posts', 'Posts page GraphQl field', 'supt'),
			'resolve'     => function() {
				return new GraphQlPost(get_post( $this->get_archive_page_id() ) );
			}
		]);
	}

	function graphql_register_relatedposts_field() {
		register_graphql_object_type('RelatedPostsType', [
			'fields' => [
				'perPage'    => [ 'type' => 'Int' ],
				'notIn'      => [ 'type' => ['list_of' => 'ID'] ],
				'categoryIn' => [ 'type' => ['list_of' => 'ID'] ],
				'tagIn'      => [ 'type' => ['list_of' => 'ID'] ],
			]
		]);

		register_graphql_field( self::GRAPHQL_TYPE_NAME, 'relatedPosts', [
			'type'        => 'RelatedPostsType',
			'description' => _x( '', 'GraphQL field desc', 'supt' ),
			'resolve'     => function($source) {
				return [
					'perPage'    => get_option(self::SETTING_NB_RELATED_POSTS),
					'notIn'      => [$source->ID],
					'categoryIn' => ( boolval( get_option(self::SETTING_RELATED_POSTS_BY_CAT) )
						? wp_get_post_terms($source->ID, CATEGORY_TAXONOMY_NAME, ['fields' => 'ids', 'exclude' => [1]])
						: []
					),
					'tagIn'      => ( boolval( get_option(self::SETTING_RELATED_POSTS_BY_TAG) )
						? wp_get_post_terms($source->ID, TAG_TAXONOMY_NAME, ['fields' => 'ids'])
						: []
					),
				];
			}
		]);
	}

}


new Post();
