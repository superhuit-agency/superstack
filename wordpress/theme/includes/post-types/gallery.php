<?php

namespace Superstack\Post_Types;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Registers the Gallery custom post type.
 *
 * @package    Superstack
 * @subpackage Superstack/Post_Types
 * @since      1.0.0
 */
class Gallery {

	use Singleton;

	/**
	 * Post type slug.
	 *
	 * @var string
	 */
	const POST_TYPE = 'gallery';

	/**
	 * Taxonomy slug.
	 *
	 * @var string
	 */
	const TAXONOMY = 'gallery_category';

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_action('init', [$this, 'register_post_type']);
		add_action('init', [$this, 'register_taxonomy']);
	}

	/**
	 * Register the Gallery post type.
	 *
	 * @access public
	 * @return void
	 */
	public function register_post_type() {
		$labels = [
			'name'                  => _x('Galeries', 'Post type general name', 'superstack'),
			'singular_name'         => _x('Galerie', 'Post type singular name', 'superstack'),
			'menu_name'             => _x('Galeries', 'Admin Menu text', 'superstack'),
			'name_admin_bar'        => _x('Galerie', 'Add New on Toolbar', 'superstack'),
			'add_new'               => __('Ajouter', 'superstack'),
			'add_new_item'          => __('Ajouter une galerie', 'superstack'),
			'new_item'              => __('Nouvelle galerie', 'superstack'),
			'edit_item'             => __('Modifier la galerie', 'superstack'),
			'view_item'             => __('Voir la galerie', 'superstack'),
			'all_items'             => __('Toutes les galeries', 'superstack'),
			'search_items'          => __('Rechercher des galeries', 'superstack'),
			'parent_item_colon'     => __('Galerie parente :', 'superstack'),
			'not_found'             => __('Aucune galerie trouvée.', 'superstack'),
			'not_found_in_trash'    => __('Aucune galerie trouvée dans la corbeille.', 'superstack'),
			'featured_image'        => _x('Image de la galerie', 'Overrides the "Featured Image" phrase', 'superstack'),
			'set_featured_image'    => _x('Définir l\'image de la galerie', 'Overrides the "Set featured image" phrase', 'superstack'),
			'remove_featured_image' => _x('Supprimer l\'image de la galerie', 'Overrides the "Remove featured image" phrase', 'superstack'),
			'use_featured_image'    => _x('Utiliser comme image de la galerie', 'Overrides the "Use as featured image" phrase', 'superstack'),
			'archives'              => _x('Archives des galeries', 'The post type archive label', 'superstack'),
			'insert_into_item'      => _x('Insérer dans la galerie', 'Overrides the "Insert into post" phrase', 'superstack'),
			'uploaded_to_this_item' => _x('Téléversé dans cette galerie', 'Overrides the "Uploaded to this post" phrase', 'superstack'),
			'filter_items_list'     => _x('Filtrer la liste des galeries', 'Screen reader text', 'superstack'),
			'items_list_navigation' => _x('Navigation de la liste des galeries', 'Screen reader text', 'superstack'),
			'items_list'            => _x('Liste des galeries', 'Screen reader text', 'superstack'),
		];

		$args = [
			'labels'             => $labels,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'query_var'          => true,
			'rewrite'            => ['slug' => 'galeries', 'with_front' => false],
			'capability_type'    => 'post',
			'has_archive'        => 'galeries',
			'hierarchical'       => false,
			'menu_position'      => 5,
			'menu_icon'          => 'dashicons-format-gallery',
			'supports'           => ['title', 'editor', 'thumbnail', 'excerpt', 'revisions'],
			'show_in_rest'       => true,
			'template'           => [
				['core/gallery', [
					'linkTo' => 'media',
					'lock'   => ['move' => false, 'remove' => true],
				]],
			],
		];

		register_post_type(self::POST_TYPE, $args);
	}

	/**
	 * Register the Gallery Category taxonomy.
	 *
	 * @access public
	 * @return void
	 */
	public function register_taxonomy() {
		$labels = [
			'name'              => _x('Catégories', 'taxonomy general name', 'superstack'),
			'singular_name'     => _x('Catégorie', 'taxonomy singular name', 'superstack'),
			'search_items'      => __('Rechercher des catégories', 'superstack'),
			'all_items'         => __('Toutes les catégories', 'superstack'),
			'parent_item'       => __('Catégorie parente', 'superstack'),
			'parent_item_colon' => __('Catégorie parente :', 'superstack'),
			'edit_item'         => __('Modifier la catégorie', 'superstack'),
			'update_item'       => __('Mettre à jour la catégorie', 'superstack'),
			'add_new_item'      => __('Ajouter une nouvelle catégorie', 'superstack'),
			'new_item_name'     => __('Nom de la nouvelle catégorie', 'superstack'),
			'menu_name'         => __('Catégories', 'superstack'),
		];

		$args = [
			'labels'            => $labels,
			'hierarchical'      => true,
			'public'            => true,
			'show_ui'           => true,
			'show_in_menu'      => true,
			'show_in_rest'      => true,
			'show_admin_column' => true,
			'rewrite'           => ['slug' => 'galeries-categorie', 'with_front' => false],
		];

		register_taxonomy(self::TAXONOMY, self::POST_TYPE, $args);
	}
}

Gallery::get_instance()->init();
