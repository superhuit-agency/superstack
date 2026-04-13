<?php

namespace Superstack\Post_Types;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Registers the Partner custom post type.
 *
 * @package    Superstack
 * @subpackage Superstack/Post_Types
 * @since      1.0.0
 */
class Partner {

	use Singleton;

	/**
	 * Post type slug.
	 *
	 * @var string
	 */
	const POST_TYPE = 'partner';

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_action('init', [$this, 'register_post_type']);

		add_filter('post_type_link', [$this, 'filter_permalink'], 10, 2);

		add_filter('wp_sitemaps_post_types', [$this, 'filter_wp_sitemaps_post_types']);
	}

	/**
	 * Register the Partner post type.
	 *
	 * @access public
	 * @return void
	 */
	public function register_post_type() {
		$labels = [
			'name'                  => _x('Partenaires', 'Post type general name', 'flavor'),
			'singular_name'         => _x('Partenaire', 'Post type singular name', 'flavor'),
			'menu_name'             => _x('Partenaires', 'Admin Menu text', 'flavor'),
			'name_admin_bar'        => _x('Partenaire', 'Add New on Toolbar', 'flavor'),
			'add_new'               => __('Ajouter', 'flavor'),
			'add_new_item'          => __('Ajouter un partenaire', 'flavor'),
			'new_item'              => __('Nouveau partenaire', 'flavor'),
			'edit_item'             => __('Modifier le partenaire', 'flavor'),
			'view_item'             => __('Voir le partenaire', 'flavor'),
			'all_items'             => __('Tous les partenaires', 'flavor'),
			'search_items'          => __('Rechercher des partenaires', 'flavor'),
			'parent_item_colon'     => __('Partenaire parent :', 'flavor'),
			'not_found'             => __('Aucun partenaire trouvé.', 'flavor'),
			'not_found_in_trash'    => __('Aucun partenaire trouvé dans la corbeille.', 'flavor'),
			'featured_image'        => _x('Image du partenaire', 'Overrides the "Featured Image" phrase', 'flavor'),
			'set_featured_image'    => _x('Définir l\'image du partenaire', 'Overrides the "Set featured image" phrase', 'flavor'),
			'remove_featured_image' => _x('Supprimer l\'image du partenaire', 'Overrides the "Remove featured image" phrase', 'flavor'),
			'use_featured_image'    => _x('Utiliser comme image du partenaire', 'Overrides the "Use as featured image" phrase', 'flavor'),
			'archives'              => _x('Archives des partenaires', 'The post type archive label', 'flavor'),
			'insert_into_item'      => _x('Insérer dans le partenaire', 'Overrides the "Insert into post" phrase', 'flavor'),
			'uploaded_to_this_item' => _x('Téléversé dans ce partenaire', 'Overrides the "Uploaded to this post" phrase', 'flavor'),
			'filter_items_list'     => _x('Filtrer la liste des partenaires', 'Screen reader text', 'flavor'),
			'items_list_navigation' => _x('Navigation de la liste des partenaires', 'Screen reader text', 'flavor'),
			'items_list'            => _x('Liste des partenaires', 'Screen reader text', 'flavor'),
		];

		$args = [
			'labels'             => $labels,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'query_var'          => true,
			'rewrite'            => ['slug' => 'partenaires', 'with_front' => false],
			'capability_type'    => 'post',
			'has_archive'        => 'a-propos/partenaires',
			'hierarchical'       => false,
			'menu_position'      => 7,
			'menu_icon'          => 'dashicons-networking',
			'supports'           => ['title', 'thumbnail', 'custom-fields', "revisions"],
			'show_in_rest'       => true,
		];

		register_post_type(self::POST_TYPE, $args);
	}

	/**
	 * Filter the permalink to use the website URL.
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

		$url = get_field('website', $post->ID);
		if (empty($url)) $url = '#';

		return esc_url($url);
	}

	/**
	 * Filter the WP sitemaps post types to exclude Partner post type.
	 *
	 * @access public
	 * @param array $post_types The post types.
	 * @return array
	 */
	public function filter_wp_sitemaps_post_types($post_types) {
		unset($post_types[self::POST_TYPE]);
		return $post_types;
	}
}

Partner::get_instance()->init();
