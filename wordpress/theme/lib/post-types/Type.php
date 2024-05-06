<?php

namespace SUPT\Types;

use WP_Post;
use function SUPT\array_find;

abstract class Type {

	// const NAME = '';
	// const GRAPHQL_TYPE_NAME = '';

	abstract function getName();
	abstract function register();
	abstract function getGraphQLTypeName();

	/**
	 * Bind all you action & filter hooks in here.
	 */
	function __construct() {
		add_action( 'init', [$this, 'register'] );

		add_action( 'rest_after_insert_'.$this->getName(), [$this, 'save_title'], 10, 3);
		add_filter( 'rest_after_insert_'.$this->getName(), [$this, 'prefix_non_public_post_type_slug' ], 10, 3);
	}

	/**
	 * Retrieve the Post id
	 *
	 * @param  WP_Post|Integer $post
	 * @return int             The post id
	 */
	function get_id( $post ) {
		return (($post instanceof WP_Post || isset($post->ID))
			? $post->ID
			: (isset($post->term_ID)
				? $post->term_ID
				: (is_numeric( $post )
					? intval( $post )
					: 0)));
	}

	/**
	 * Determine if the current request
	 * is the duplication of a post to create a translation
	 */
	function isTranslationDuplication() {
		$isDuplication = (
			isset($_GET['from_post']) &&
			isset($_GET['new_lang']) &&
			isset($_GET['post_type']) &&
			$_GET['post_type'] === $this->getName()
		);

		if ( $isDuplication )  {
			// Copied from wordpress/plugins/polylang-pro/modules/duplicate/duplicate-trait.php:33
			$duplicate_options = get_user_meta( get_current_user_id(), 'pll_duplicate_content', true );
			$isDuplication = ! empty( $duplicate_options ) && ! empty( $duplicate_options[ $this->getName() ] );
		}

		return $isDuplication;
	}

	/**
	 *
	 * @param int     $post_id     Post ID.
	 * @param WP_Post $post        Post object.
	 * @param bool    $update      Whether this is an existing post being updated.
	 */
	function prefix_non_public_post_type_slug($post_ID, $post, $update) {
		if ( is_post_type_viewable($this->getName()) || wp_is_post_revision($post_ID) || wp_is_post_autosave($post_ID) ) return;

		if ( strpos($post->post_name, $this->getName()) !== false ) return;

		// Prevents an infinite loop
		if( !empty($GLOBALS[ "prefix_post_slug-{$post_ID}" ]) ) return;
		$GLOBALS["prefix_post_slug-{$post_ID}"] = true;

		$prefix = $this->getName();

		if ( function_exists('pll_get_post_language') ) {
			$post_lang = pll_get_post_language($post_ID);

			if ( strpos($post->post_name, $post_lang) !== strlen($post->post_name) - strlen($post_lang) ) {
				$prefix .= "-$post_lang";
			}
		}

		wp_update_post([
			'ID'        => $post_ID,
			'post_name' => "$prefix--{$post->post_name}",
		]);

		// reset global varibale to allow this filter to function as per normal
		$GLOBALS[ "prefix_post_slug-{$post_ID}" ] = 0;
	}

	/**
	 * Updates Post title with the first block with a title
	 *
	 * @param WP_Post         $post     Inserted or updated post object.
	 * @param WP_REST_Request $request  Request object.
	 * @param bool            $creating True when creating a post, false when updating.
	 */
	function save_title( $post, $request, $creating ) {
		if ( (! is_post_type_viewable($this->getName())) || wp_is_post_revision($post->ID) || wp_is_post_autosave($post->ID) ) return;

		if ( strpos($post->post_name, $this->getName()) !== false ) return;

		// Prevents an infinite loop
		if( !empty($GLOBALS[ "save_title-{$post->ID}" ]) ) return;
		$GLOBALS[ "save_title-{$post->ID}" ] = true;

		$blocks = parse_blocks( $post->post_content );

		// Find the first block with direct `title` attribute.
		// But PageHeader and Sections should all have a direct `title` attribute.
		$block = array_find($blocks, function($block) {
			return isset($block['attrs']['title']);
		});

		$post_title = wp_strip_all_tags($block['attrs']['title'] ?? '');

		if ( !empty($post_title) ) {
			$updated_post = [
				'ID'         => $post->ID,
				'post_title' => $post_title,
			];

			// It's creating => we set as well the post_name
			if(strpos($post->post_name, strval($post->ID)) !== false ) {
				$updated_post['post_name'] = sanitize_title($post_title, $post->ID);
			}

			// Update the post title/slug (Need to set both times otherwise new pages were saved without title/slug)
			$post->post_title = $post_title;

			wp_update_post( $updated_post );

		}

		// reset global variable to allow this filter to function as per normal
		$GLOBALS[ "save_title-{$post->ID}" ] = false;
	}

}
