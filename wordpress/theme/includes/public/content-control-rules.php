<?php

namespace Superstack\Public;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Registers custom Content Control rules.
 *
 * @package    Superstack
 * @subpackage Superstack/Public
 * @since      1.0.0
 */

add_filter('content_control/rule_engine/post_type_rules', __NAMESPACE__ . '\register_descendant_rule', 10, 3);

/**
 * Add a "Descendant of" rule for hierarchical post types.
 *
 * @param array<string,array<string,mixed>> $type_rules Post type rules.
 * @param string                            $name       Post type name.
 * @param \WP_Post_Type                     $post_type  Post type object.
 * @return array<string,array<string,mixed>>
 */
function register_descendant_rule($type_rules, $name, $post_type) {
	if (! is_post_type_hierarchical($name)) {
		return $type_rules;
	}

	$type_rules["content_is_descendant_of_{$name}"] = [
		'name'     => "content_is_descendant_of_{$name}",
		/* translators: %s: Post type plural name */
		'label'    => sprintf(__('A Descendant of Selected %s', 'superstack'), $post_type->labels->name),
		'context'  => ['content', "posttype:{$name}"],
		'category' => __('Content', 'content-control'),
		'format'   => '{category} {verb} {label}',
		'verbs'    => [
			__('Is', 'content-control'),
			__('Is Not', 'content-control'),
		],
		'fields'   => [
			'selected' => [
				/* translators: %s: Post type plural name */
				'placeholder' => sprintf(__('Select %s', 'content-control'), strtolower($post_type->labels->name)),
				'type'        => 'postselect',
				'post_type'   => $name,
				'multiple'    => true,
			],
		],
		'extras'   => [
			'post_type' => $name,
		],
		'callback' => __NAMESPACE__ . '\content_is_descendant_of_post',
	];

	return $type_rules;
}

/**
 * Check if the current post is a descendant (at any depth) of a selected post.
 *
 * Uses get_post_ancestors() to walk the full parent chain,
 * unlike the built-in "child of" rule which only checks direct parent.
 *
 * @return bool
 */
function content_is_descendant_of_post() {
	global $post;

	$context   = \ContentControl\current_query_context();
	$post_type = \ContentControl\Rules\get_rule_extra('post_type', '');
	$selected  = \wp_parse_id_list(
		\ContentControl\Rules\get_rule_option('selected', [])
	);

	if (! \is_post_type_hierarchical($post_type)) {
		return false;
	}

	$the_post = isset($post) ? $post : null;

	switch ($context) {
		case 'main':
		case 'main/blocks':
			$main_query = \ContentControl\get_main_wp_query();
			if (! $main_query->is_singular($post_type)) {
				return false;
			}
			break;

		case 'main/posts':
		case 'posts':
		case 'blocks':
		case 'restapi/posts':
			if (! \ContentControl\Rules\is_post_type($post_type)) {
				return false;
			}
			break;

		case 'restapi':
			$rest_intent = \ContentControl\get_rest_api_intent();

			if ('unknown' === $rest_intent['type']) {
				return false;
			}

			if (! \ContentControl\Rules\rest_intent_matches_post_type($post_type, $rest_intent)) {
				return false;
			}

			if ($rest_intent['id'] > 0) {
				$the_post = get_post((int) $rest_intent['id']);
			}
			break;

		case 'restapi/terms':
		case 'terms':
		case 'unknown':
		default:
			return false;
	}

	if (! $the_post) {
		return false;
	}

	$ancestors = \get_post_ancestors($the_post->ID);

	foreach ($selected as $id) {
		if (in_array($id, $ancestors, true)) {
			return true;
		}
	}

	return false;
}
