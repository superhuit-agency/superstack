<?php

namespace Superstack\Post_Types;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Registers the Event custom post type.
 *
 * @package    Superstack
 * @subpackage Superstack/Post_Types
 * @since      1.0.0
 */
class Event {

	use Singleton;

	/**
	 * Post type slug.
	 *
	 * @var string
	 */
	const POST_TYPE = 'event';

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_action('init', [$this, 'register_post_type']);
		add_filter('manage_' . self::POST_TYPE . '_posts_columns', [$this, 'add_admin_columns']);
		add_action('manage_' . self::POST_TYPE . '_posts_custom_column', [$this, 'render_admin_columns'], 10, 2);
		add_filter('manage_edit-' . self::POST_TYPE . '_sortable_columns', [$this, 'sortable_columns']);
		add_action('pre_get_posts', [$this, 'default_sort_by_start_date']);
	}

	/**
	 * Register the Event post type.
	 *
	 * @access public
	 * @return void
	 */
	public function register_post_type() {
		$labels = [
			'name'                  => _x('Agenda', 'Post type general name', 'flavor'),
			'singular_name'         => _x('Événement', 'Post type singular name', 'flavor'),
			'menu_name'             => _x('Agenda', 'Admin Menu text', 'flavor'),
			'name_admin_bar'        => _x('Événement', 'Add New on Toolbar', 'flavor'),
			'add_new'               => __('Ajouter', 'flavor'),
			'add_new_item'          => __('Ajouter un événement', 'flavor'),
			'new_item'              => __('Nouvel événement', 'flavor'),
			'edit_item'             => __('Modifier l\'événement', 'flavor'),
			'view_item'             => __('Voir l\'événement', 'flavor'),
			'all_items'             => __('Tous les événements', 'flavor'),
			'search_items'          => __('Rechercher des événements', 'flavor'),
			'parent_item_colon'     => __('Événement parent :', 'flavor'),
			'not_found'             => __('Aucun événement trouvé.', 'flavor'),
			'not_found_in_trash'    => __('Aucun événement trouvé dans la corbeille.', 'flavor'),
			'featured_image'        => _x('Image de l\'événement', 'Overrides the "Featured Image" phrase', 'flavor'),
			'set_featured_image'    => _x('Définir l\'image de l\'événement', 'Overrides the "Set featured image" phrase', 'flavor'),
			'remove_featured_image' => _x('Supprimer l\'image de l\'événement', 'Overrides the "Remove featured image" phrase', 'flavor'),
			'use_featured_image'    => _x('Utiliser comme image de l\'événement', 'Overrides the "Use as featured image" phrase', 'flavor'),
			'archives'              => _x('Archives des événements', 'The post type archive label', 'flavor'),
			'insert_into_item'      => _x('Insérer dans l\'événement', 'Overrides the "Insert into post" phrase', 'flavor'),
			'uploaded_to_this_item' => _x('Téléversé dans cet événement', 'Overrides the "Uploaded to this post" phrase', 'flavor'),
			'filter_items_list'     => _x('Filtrer la liste des événements', 'Screen reader text', 'flavor'),
			'items_list_navigation' => _x('Navigation de la liste des événements', 'Screen reader text', 'flavor'),
			'items_list'            => _x('Liste des événements', 'Screen reader text', 'flavor'),
		];

		$args = [
			'labels'             => $labels,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'query_var'          => true,
			'rewrite'            => ['slug' => 'agenda', 'with_front' => false],
			'capability_type'    => 'post',
			'has_archive'        => 'agenda',
			'hierarchical'       => false,
			'menu_position'      => 5,
			'menu_icon'          => 'dashicons-calendar-alt',
			'supports'           => ['title', 'editor', 'thumbnail', 'excerpt', 'revisions'],
			'show_in_rest'       => true,
		];

		register_post_type(self::POST_TYPE, $args);
	}

	/**
	 * Add custom columns to the admin list table.
	 *
	 * @access public
	 * @param  array $columns Existing columns.
	 * @return array
	 */
	public function add_admin_columns($columns) {
		$new_columns = [];

		foreach ($columns as $key => $value) {
			$new_columns[$key] = $value;

			if ('title' === $key) {
				$new_columns['event_dates'] = __('Dates', 'flavor');
			}
		}

		unset($new_columns['date']);

		return $new_columns;
	}

	/**
	 * Render custom column content.
	 *
	 * @access public
	 * @param  string $column  Column name.
	 * @param  int    $post_id Post ID.
	 * @return void
	 */
	public function render_admin_columns($column, $post_id) {
		if ('event_dates' !== $column) {
			return;
		}

		$start = get_field('event_start_date', $post_id);
		$end   = get_field('event_end_date', $post_id);

		if (! $start) {
			echo '—';
			return;
		}

		$start_formatted = wp_date('d.m.Y H:i', strtotime($start));
		$output          = esc_html($start_formatted);

		if ($end) {
			$end_formatted = wp_date('d.m.Y H:i', strtotime($end));
			$output       .= ' → ' . esc_html($end_formatted);
		}

		echo $output;
	}

	/**
	 * Register sortable columns.
	 *
	 * @access public
	 * @param  array $columns Sortable columns.
	 * @return array
	 */
	public function sortable_columns($columns) {
		$columns['event_dates'] = 'event_start_date';

		return $columns;
	}

	/**
	 * Default sort by event_start_date DESC on admin list.
	 *
	 * @access public
	 * @param  \WP_Query $query The query object.
	 * @return void
	 */
	public function default_sort_by_start_date($query) {
		if (! is_admin() || ! $query->is_main_query()) {
			return;
		}

		if (self::POST_TYPE !== $query->get('post_type')) {
			return;
		}

		$orderby = $query->get('orderby');

		if ('event_start_date' === $orderby) {
			$query->set('meta_key', 'event_start_date');
			$query->set('orderby', 'meta_value');
		}

		if ('' === $orderby) {
			$query->set('meta_key', 'event_start_date');
			$query->set('orderby', 'meta_value');
			$query->set('order', 'DESC');
		}
	}
}

Event::get_instance()->init();
