<?php

namespace Superstack\Post_Types;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Registers the Press Review custom post type.
 *
 * @package    Superstack
 * @subpackage Superstack/Post_Types
 * @since      1.0.0
 */
class Press_Review {

	use Singleton;

	/**
	 * Post type slug.
	 *
	 * @var string
	 */
	const POST_TYPE = 'press_review';

	/**
	 * Taxonomy slug.
	 *
	 * @var string
	 */
	const TAXONOMY = 'press_review_type';

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_action('init', [$this, 'register_post_type']);
		add_action('init', [$this, 'register_taxonomy']);
		add_filter('post_type_link', [$this, 'filter_permalink'], 10, 2);
		add_filter('get_the_excerpt', [$this, 'filter_excerpt'], 10, 2);

		add_filter('wp_sitemaps_post_types', [$this, 'filter_wp_sitemaps_post_types']);

		add_action('acf/save_post', [$this, 'sync_type_to_taxonomy']);
		add_filter('render_block', [$this, 'swap_audio_card_pattern'], 10, 3);
		add_filter('render_block_core/audio', [$this, 'inject_audio_block_src'], 10, 3);
	}

	/**
	 * Register the Press Review post type.
	 *
	 * @access public
	 * @return void
	 */
	public function register_post_type() {
		$labels = [
			'name'                  => _x('Revue de presse', 'Post type general name', 'superstack'),
			'singular_name'         => _x('Revue de presse', 'Post type singular name', 'superstack'),
			'menu_name'             => _x('Revue de presse', 'Admin Menu text', 'superstack'),
			'name_admin_bar'        => _x('Revue de presse', 'Add New on Toolbar', 'superstack'),
			'add_new'               => __('Ajouter', 'superstack'),
			'add_new_item'          => __('Ajouter une revue', 'superstack'),
			'new_item'              => __('Nouvelle revue', 'superstack'),
			'edit_item'             => __('Modifier la revue', 'superstack'),
			'view_item'             => __('Voir la revue', 'superstack'),
			'all_items'             => __('Toutes les revues', 'superstack'),
			'search_items'          => __('Rechercher des revues', 'superstack'),
			'parent_item_colon'     => __('Revue parente :', 'superstack'),
			'not_found'             => __('Aucune revue trouvée.', 'superstack'),
			'not_found_in_trash'    => __('Aucune revue trouvée dans la corbeille.', 'superstack'),
			'archives'              => _x('Revue de presse', 'The post type archive label', 'superstack'),
			'insert_into_item'      => _x('Insérer dans la revue', 'Overrides the "Insert into post" phrase', 'superstack'),
			'uploaded_to_this_item' => _x('Téléversé dans cette revue', 'Overrides the "Uploaded to this post" phrase', 'superstack'),
			'filter_items_list'     => _x('Filtrer la liste des revues', 'Screen reader text', 'superstack'),
			'items_list_navigation' => _x('Navigation de la liste des revues', 'Screen reader text', 'superstack'),
			'items_list'            => _x('Liste des revues', 'Screen reader text', 'superstack'),
		];

		$args = [
			'labels'             => $labels,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'query_var'          => true,
			'rewrite'            => ['slug' => 'revue-de-presse', 'with_front' => false],
			'capability_type'    => 'post',
			'has_archive'        => 'revue-de-presse',
			'hierarchical'       => false,
			'menu_position'      => 5,
			'menu_icon'          => 'dashicons-admin-links',
			'supports'           => ['title', 'revisions'],
			'show_in_rest'       => true,
		];

		register_post_type(self::POST_TYPE, $args);
	}

	/**
	 * Register the Press Review Type taxonomy and default terms.
	 *
	 * @access public
	 * @return void
	 */
	public function register_taxonomy() {
		$labels = [
			'name'              => _x('Types', 'taxonomy general name', 'superstack'),
			'singular_name'     => _x('Type', 'taxonomy singular name', 'superstack'),
			'search_items'      => __('Rechercher des types', 'superstack'),
			'all_items'         => __('Tous les types', 'superstack'),
			'edit_item'         => __('Modifier le type', 'superstack'),
			'update_item'       => __('Mettre à jour le type', 'superstack'),
			'add_new_item'      => __('Ajouter un nouveau type', 'superstack'),
			'new_item_name'     => __('Nom du nouveau type', 'superstack'),
			'menu_name'         => __('Types', 'superstack'),
		];

		$args = [
			'labels'            => $labels,
			'hierarchical'      => false,
			'public'            => true,
			'show_ui'           => true,
			'show_in_menu'      => true,
			'show_in_rest'      => true,
			'show_admin_column' => true,
			'meta_box_cb'       => false,
			'rewrite'           => ['slug' => 'revue-de-presse-type', 'with_front' => false],
		];

		register_taxonomy(self::TAXONOMY, self::POST_TYPE, $args);

		if (! term_exists('link', self::TAXONOMY)) {
			wp_insert_term('Lien', self::TAXONOMY, ['slug' => 'link']);
		}
		if (! term_exists('audio', self::TAXONOMY)) {
			wp_insert_term('Audio', self::TAXONOMY, ['slug' => 'audio']);
		}
	}

	/**
	 * Filter the excerpt to use the ACF short description field.
	 *
	 * @access public
	 * @param string  $excerpt The post excerpt.
	 * @param WP_Post $post    The post object.
	 * @return string
	 */
	public function filter_excerpt($excerpt, $post) {
		if (self::POST_TYPE !== $post->post_type) {
			return $excerpt;
		}

		$short_description = get_field('excerpt', $post->ID);

		if (! empty($short_description)) {
			return esc_html($short_description);
		}

		return $excerpt;
	}

	/**
	 * Filter the permalink to use the external URL.
	 *
	 * @access public
	 * @param string  $post_link The post's permalink.
	 * @param WP_Post $post      The post object.
	 * @return string
	 */
	public function filter_permalink($post_link, $post) {
		if (self::POST_TYPE !== $post->post_type) {
			return $post_link;
		}

		$url = get_field('url', $post->ID);
		if (empty($url)) $url = '#';

		return esc_url($url);
	}

	/**
	 * Filter the WP sitemaps post types to exclude the Press Review post type.
	 *
	 * @access public
	 * @param array $post_types The post types.
	 * @return array
	 */
	public function filter_wp_sitemaps_post_types($post_types) {
		unset($post_types[self::POST_TYPE]);
		return $post_types;
	}

	/**
	 * Sync the ACF type field value to the taxonomy.
	 *
	 * @access public
	 * @param int $post_id The post ID.
	 * @return void
	 */
	public function sync_type_to_taxonomy($post_id) {
		if (self::POST_TYPE !== get_post_type($post_id)) {
			return;
		}

		$type = get_field('press_review_type', $post_id);

		if (! empty($type)) {
			wp_set_object_terms($post_id, $type, self::TAXONOMY);
		}
	}

	/**
	 * Inject the ACF audio file URL into the audio block data for press review posts.
	 *
	 * @access public
	 * @param string   $block_content The rendered block content.
	 * @param array    $parsed_block  The parsed block data.
	 * @param WP_Block $block         The block instance.
	 * @return string
	 */
	public function inject_audio_block_src($block_content, $parsed_block, $block) {
		$post_id = $block->context['postId'] ?? 0;

		if (0 === $post_id || self::POST_TYPE !== get_post_type($post_id)) {
			return $block_content;
		}

		$audio_file = get_field('audio_file', $post_id);

		if (empty($audio_file['url'])) {
			return $block_content;
		}

		return sprintf(
			'<figure class="wp-block-audio"><audio controls src="%s"></audio></figure>',
			esc_url($audio_file['url'])
		);
	}

	/**
	 * Swap the press review card pattern for the audio card pattern
	 * when the current post's type is "audio".
	 *
	 * @access public
	 * @param string   $block_content The rendered block content.
	 * @param array    $parsed_block  The block being rendered.
	 * @param WP_Block $block         The block instance.
	 * @return string
	 */
	public function swap_audio_card_pattern($block_content, $parsed_block, $block) {
		$class_name = $parsed_block['attrs']['className'] ?? '';

		if (false === strpos($class_name, 'spck-card-post') || false === strpos($class_name, '-press-review')) {
			return $block_content;
		}

		if (! has_term('audio', self::TAXONOMY)) {
			return $block_content;
		}

		$pattern = \WP_Block_Patterns_Registry::get_instance()->get_registered('superstack/card-post-audio');

		if (null === $pattern) {
			return $block_content;
		}

		return do_blocks($pattern['content']);
	}
}

Press_Review::get_instance()->init();
