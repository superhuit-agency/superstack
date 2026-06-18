<?php

namespace Superstack\GraphQL;

class RegisterFseTemplates {

	function __construct() {
		add_filter('register_post_type_args', [$this, 'expose_block_templates_to_graphql'], 10, 2);
		add_filter('graphql_register_types', [$this, 'register_resolved_template_field'], 20);
		add_filter('graphql_register_types', [$this, 'register_template_part_area_field'], 20);
		add_filter('graphql_register_types', [$this, 'register_all_template_parts_field'], 20);
		add_filter('graphql_register_types', [$this, 'register_all_templates_field'], 20);
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
	 * Add the `fseTemplate` field to all PostTypes
	 */
	function register_resolved_template_field() {
		register_graphql_object_type('FseTemplateInfo', [
			'description' => 'FSE template resolved for a content node',
			'fields'      => [
				'slug' => ['type' => 'String'],
			],
		]);

		$resolver = function ($source) {
			$post = get_post($source->databaseId);

			if (! $post) {
				return null;
			}

			// A template explicitly assigned via the block editor is stored in post meta.
			// Prepend it to the hierarchy so it wins over the generic fallbacks,
			// mirroring what WordPress core does in get_single_template() / get_page_template().
			$assigned = get_page_template_slug($post);

			if ('page' === $post->post_type) {
				if (
					! empty(get_option('page_for_posts')) &&
					(int) get_option('page_for_posts') === (int) $post->ID
				) {
					$template_type = 'home';
					$hierarchy     = ['home'];
				} else {
					$template_type = 'page';
					$hierarchy     = ['page-' . $post->post_name, 'page'];

					if (
						! empty(get_option('page_on_front')) &&
						(int) get_option('page_on_front') === (int) $post->ID
					) {
						array_unshift($hierarchy, 'front-page');
					}

					if ($assigned && 0 === validate_file($assigned)) {
						array_unshift($hierarchy, $assigned);
					}
				}
			} else {
				$template_type = 'single';
				$hierarchy     = [
					'single-' . $post->post_type . '-' . $post->post_name,
					'single-' . $post->post_type,
					'single',
				];

				if ($assigned && 0 === validate_file($assigned)) {
					array_unshift($hierarchy, $assigned);
				}
			}

			$resolved = resolve_block_template($template_type, $hierarchy, '');

			if (! $resolved) {
				return null;
			}

			return ['slug' => $resolved->slug];
		};

		$post_types = get_post_types(['show_in_graphql' => true], 'objects');
		foreach ($post_types as $post_type) {
			if (in_array($post_type->name, ['wp_template', 'wp_template_part'])) {
				continue;
			}
			$graphql_type = ! empty($post_type->graphql_single_name)
				? ucfirst($post_type->graphql_single_name)
				: null;
			if (! $graphql_type) continue;

			register_graphql_field($graphql_type, 'fseTemplate', [
				'type'        => 'FseTemplateInfo',
				'description' => _x('The FSE template used for this content node.', 'GraphQL field desc', 'supt'),
				'resolve'     => $resolver,
			]);
		}

		register_graphql_field('ContentType', 'fseTemplate', [
			'type'        => 'FseTemplateInfo',
			'description' => _x('The FSE template used for this content type archive.', 'GraphQL field desc', 'supt'),
			'resolve'     => function ($source) {
				$post_type_name = $source->name;
				if (! $post_type_name) return null;

				$hierarchy = ["archive-{$post_type_name}", 'archive'];
				$resolved  = resolve_block_template('archive', $hierarchy, '');

				if (! $resolved) return null;

				return ['slug' => $resolved->slug];
			},
		]);
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
	/**
	 * Register an `allTemplateParts` root query field that returns every template part —
	 * including theme-file based ones that are never stored as database posts and therefore
	 * invisible to the standard `templateParts` WPGraphQL connection.
	 */
	function register_all_template_parts_field() {
		register_graphql_object_type('FseTemplatePart', [
			'description' => 'FSE template part data (DB or theme-file based)',
			'fields'      => [
				'slug'       => ['type' => 'String'],
				'area'       => ['type' => 'String'],
				'blocksJSON' => ['type' => 'String'],
			],
		]);

		register_graphql_field('RootQuery', 'allTemplateParts', [
			'type'        => ['list_of' => 'FseTemplatePart'],
			'description' => 'All FSE template parts, including theme-file based ones',
			'resolve'     => function () {
				$parts = get_block_templates([], 'wp_template_part');
				return array_map([$this, 'format_template_part'], $parts);
			},
		]);
	}

	/**
	 * Register an `allTemplates` root query field that returns every template —
	 * including theme-file based ones invisible to the standard `templates` WPGraphQL connection.
	 */
	function register_all_templates_field() {
		register_graphql_object_type('FseTemplate', [
			'description' => 'FSE template data (DB or theme-file based)',
			'fields'      => [
				'slug'       => ['type' => 'String'],
				'blocksJSON' => ['type' => 'String'],
			],
		]);

		register_graphql_field('RootQuery', 'allTemplates', [
			'type'        => ['list_of' => 'FseTemplate'],
			'description' => 'All FSE templates, including theme-file based ones',
			'resolve'     => function () {
				$templates = get_block_templates([], 'wp_template');
				return array_map([$this, 'format_template'], $templates);
			},
		]);
	}

	private function format_template(\WP_Block_Template $template): array {
		return [
			'slug'       => $template->slug,
			'blocksJSON' => $this->build_blocks_json($template->content ?? ''),
		];
	}

	private function format_template_part(\WP_Block_Template $part): array {
		return [
			'slug'       => $part->slug,
			'area'       => $part->area ?? null,
			'blocksJSON' => $this->build_blocks_json($part->content ?? ''),
		];
	}

	private function build_blocks_json(string $content): string {
		if (empty(trim($content))) return '[]';

		$blocks = \WPGraphQLGutenberg\Blocks\Block::create_blocks(
			parse_blocks($content),
			0,
			\WPGraphQLGutenberg\Blocks\Registry::get_registry()
		);

		return \WPGraphQLGutenberg\Blocks\BlocksJSON::encode_blocks($blocks, null);
	}
}

new RegisterFseTemplates();
