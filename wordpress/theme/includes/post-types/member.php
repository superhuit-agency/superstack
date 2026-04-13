<?php

namespace Superstack\Post_Types;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Registers the Member custom post type.
 *
 * @package    Superstack
 * @subpackage Superstack/Post_Types
 * @since      1.0.0
 */
class Member {

	use Singleton;

	/**
	 * Post type slug.
	 *
	 * @var string
	 */
	const POST_TYPE = 'member';

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_action('init', [$this, 'register_post_type']);

		add_filter('post_type_link', [$this, 'filter_permalink'], 10, 2);
		add_filter('the_content', [$this, 'filter_content']);

		add_filter('wp_sitemaps_post_types', [$this, 'filter_wp_sitemaps_post_types']);
	}

	/**
	 * Register the Member post type.
	 *
	 * @access public
	 * @return void
	 */
	public function register_post_type() {
		$labels = [
			'name'                  => _x('Membres', 'Post type general name', 'flavor'),
			'singular_name'         => _x('Membre', 'Post type singular name', 'flavor'),
			'menu_name'             => _x('Membres', 'Admin Menu text', 'flavor'),
			'name_admin_bar'        => _x('Membre', 'Add New on Toolbar', 'flavor'),
			'add_new'               => __('Ajouter', 'flavor'),
			'add_new_item'          => __('Ajouter un membre', 'flavor'),
			'new_item'              => __('Nouveau membre', 'flavor'),
			'edit_item'             => __('Modifier le membre', 'flavor'),
			'view_item'             => __('Voir le membre', 'flavor'),
			'all_items'             => __('Tous les membres', 'flavor'),
			'search_items'          => __('Rechercher des membres', 'flavor'),
			'parent_item_colon'     => __('Membre parent :', 'flavor'),
			'not_found'             => __('Aucun membre trouvé.', 'flavor'),
			'not_found_in_trash'    => __('Aucun membre trouvé dans la corbeille.', 'flavor'),
			'featured_image'        => _x('Image du membre', 'Overrides the "Featured Image" phrase', 'flavor'),
			'set_featured_image'    => _x('Définir l\'image du membre', 'Overrides the "Set featured image" phrase', 'flavor'),
			'remove_featured_image' => _x('Supprimer l\'image du membre', 'Overrides the "Remove featured image" phrase', 'flavor'),
			'use_featured_image'    => _x('Utiliser comme image du membre', 'Overrides the "Use as featured image" phrase', 'flavor'),
			'archives'              => _x('Archives des membres', 'The post type archive label', 'flavor'),
			'insert_into_item'      => _x('Insérer dans le membre', 'Overrides the "Insert into post" phrase', 'flavor'),
			'uploaded_to_this_item' => _x('Téléversé dans ce membre', 'Overrides the "Uploaded to this post" phrase', 'flavor'),
			'filter_items_list'     => _x('Filtrer la liste des membres', 'Screen reader text', 'flavor'),
			'items_list_navigation' => _x('Navigation de la liste des membres', 'Screen reader text', 'flavor'),
			'items_list'            => _x('Liste des membres', 'Screen reader text', 'flavor'),
		];

		$args = [
			'labels'             => $labels,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'query_var'          => true,
			'rewrite'            => ['slug' => 'membres', 'with_front' => false],
			'capability_type'    => 'post',
			'has_archive'        => 'a-propos/membres',
			'hierarchical'       => false,
			'menu_position'      => 6,
			'menu_icon'          => 'dashicons-groups',
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

		$url = get_field('contact_website', $post->ID);
		if (empty($url)) $url = '#';

		return esc_url($url);
	}

	/**
	 * Filter the content to display ACF fields for member cards.
	 *
	 * @access public
	 * @param string $content The post content.
	 * @return string
	 */
	public function filter_content($content) {
		$post = get_post();
		if (!$post || self::POST_TYPE !== $post->post_type) {
			return $content;
		}

		$fields = get_fields($post->ID);
		$parts  = [];

		if (!empty($fields['excerpt'])) {
			$parts[] = '<p>' . esc_html($fields['excerpt']) . '</p>';
		}

		if (!empty($fields['address'])) {
			$address_lines = array_filter([
				$fields['address']['name'] ?: "{$fields['address']['street_name']} {$fields['address']['street_number']}",
				$fields['address']['post_code'] . " " . $fields['address']['city'],
			]);
			if (!empty($address_lines)) {
				$parts[] = '<p>' . implode('<br/>', array_map('esc_html', $address_lines)) . '</p>';
			}
		}

		$contact_parts = [];
		if (!empty($fields['contact']['phone'])) {
			$phone           = $fields['contact']['phone'];
			$phone_clean     = preg_replace('/[^\d+]/', '', $phone);
			$contact_parts[] = '<a href="' . esc_url('tel:' . $phone_clean) . '">' . esc_html($phone) . '</a>';
		}

		if (!empty($fields['contact']['email'])) {
			$email   = $fields['contact']['email'];
			$contact_parts[] = '<a href="' . esc_url('mailto:' . $email) . '">' . esc_html($email) . '</a>';
		}

		if (!empty($contact_parts)) {
			$parts[] = '<p>' . implode('<br/>', $contact_parts) . '</p>';
		}

		return implode("\n", $parts);
	}

	/**
	 * Filter the WP sitemaps post types to exclude Member post type.
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

Member::get_instance()->init();
