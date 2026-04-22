<?php

namespace Superstack\GraphQL;

class RegisterFseTemplates {

	function __construct() {
		add_filter('register_post_type_args', [$this, 'expose_block_templates_to_graphql'], 10, 2);
		add_filter('graphql_register_types', [$this, 'register_resolved_template_field'], 20);
		add_filter('graphql_register_types', [$this, 'register_template_part_area_field'], 20);
	}

	/**
	 * Expose FSE internals (`wp_template` / `wp_template_part`) in WPGraphQL schema.
	 */
	function expose_block_templates_to_graphql($args, $post_type) {
		if (in_array($post_type, ['wp_template', 'wp_template_part'])) {
			$args['public']             = true;
			$args['publicly_queryable'] = true;
			$args['show_in_graphql']    = true;

			if ($post_type === 'wp_template') {
				$args['graphql_single_name'] = 'Template';
				$args['graphql_plural_name'] = 'Templates';
			} else {
				$args['graphql_single_name'] = 'TemplatePart';
				$args['graphql_plural_name'] = 'TemplateParts';
			}
		}
		return $args;
	}

	/**
	 * Add the `fseTemplate` field to the Page and Post types
	 */
	function register_resolved_template_field() {
		$resolver = function ($source) {
			$post = get_post($source->databaseId);

			if (! $post) {
				return null;
			}

			$template_type = $post->post_type;
			$hierarchy     = [$post->post_type . '-' . $post->post_name, $post->post_type];

			if (
				'page' === $post->post_type &&
				! empty(get_option('page_on_front')) &&
				(int) get_option('page_on_front') === (int) $post->ID
			) {
				array_unshift($hierarchy, 'front-page');
			}

			$resolved = resolve_block_template($template_type, $hierarchy, '');

			if (! $resolved) {
				return null;
			}

			$templates = get_block_templates(['slug__in' => [$resolved->slug]]);

			if (empty($templates) || empty($templates[0]->wp_id)) {
				return null;
			}

			$template_post = get_post($templates[0]->wp_id);

			if (! $template_post) {
				return null;
			}

			return new \WPGraphQL\Model\Post($template_post);
		};

		foreach (['Page', 'Post'] as $type_name) {
			register_graphql_field($type_name, 'fseTemplate', [
				'type'        => 'Template',
				'description' => _x('The FSE template used for this content node.', 'GraphQL field desc', 'supt'),
				'resolve'     => $resolver,
			]);
		}
	}

	/**
	 * Expose the wp_template_part area taxonomy as a simple GraphQL field.
	 */
	function register_template_part_area_field() {
		register_graphql_field('TemplatePart', 'area', [
			'type'        => 'String',
			'description' => _x('The template part area slug (header, footer, uncategorized, ...).', 'GraphQL field desc', 'supt'),
			'resolve'     => function ($source) {
				$post_id = 0;

				if (is_object($source)) {
					if (! empty($source->databaseId)) {
						$post_id = absint($source->databaseId);
					} elseif (! empty($source->ID)) {
						$post_id = absint($source->ID);
					} elseif (method_exists($source, 'get_database_id')) {
						$post_id = absint($source->get_database_id());
					}
				}

				if (! $post_id) {
					return null;
				}

				$areas = get_the_terms($post_id, 'wp_template_part_area');
				if (empty($areas) || is_wp_error($areas)) {
					return null;
				}

				$first = array_shift($areas);
				return ! empty($first->slug) ? $first->slug : null;
			},
		]);
	}
}

new RegisterFseTemplates();
