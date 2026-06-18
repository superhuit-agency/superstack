<?php

namespace Superstack\GraphQL;

class RegisterContentTypeTranslations {

	function __construct() {
		add_filter('graphql_register_types', [$this, 'register_translations_field'], 20);
	}

	/**
	 * Add a `translations` field to ContentType (post type archives).
	 *
	 * Polylang only exposes `translation` / `language` / `translations` on content
	 * nodes and terms — a ContentType is a schema-level object with no language.
	 * Archive URIs still differ per language (lang prefix, translated posts page),
	 * so we expose one `{ uri, language }` entry per configured language, mirroring
	 * the shape of Page/Post translations. The frontend picks the current one from
	 * the requested language.
	 */
	function register_translations_field() {
		if (! function_exists('pll_languages_list')) {
			return;
		}

		register_graphql_object_type('ContentTypeTranslationLanguage', [
			'description' => _x('Language of a content type archive translation.', 'GraphQL type desc', 'supt'),
			'fields'      => [
				'code'   => ['type' => 'String'],
				'locale' => ['type' => 'String'],
			],
		]);

		register_graphql_object_type('ContentTypeTranslation', [
			'description' => _x('A content type archive URI in a given language.', 'GraphQL type desc', 'supt'),
			'fields'      => [
				'uri'      => ['type' => 'String'],
				'language' => ['type' => 'ContentTypeTranslationLanguage'],
			],
		]);

		register_graphql_field('ContentType', 'translations', [
			'type'        => ['list_of' => 'ContentTypeTranslation'],
			'description' => _x('The archive URI of this content type in every configured language.', 'GraphQL field desc', 'supt'),
			'resolve'     => function ($source) {
				$post_type = get_post_type_object($source->name ?? '');

				if (! $post_type) {
					return [];
				}

				$slugs   = pll_languages_list(['fields' => 'slug']);
				$locales = pll_languages_list(['fields' => 'locale']);

				$translations = [];
				foreach ($slugs as $i => $lang_slug) {
					$uri = $this->get_archive_uri($post_type, $lang_slug);

					if (! $uri) {
						continue;
					}

					$translations[] = [
						'uri'      => $uri,
						'language' => [
							'code'   => strtoupper($lang_slug),
							'locale' => $locales[$i] ?? $lang_slug,
						],
					];
				}

				return $translations;
			},
		]);
	}

	/**
	 * Build the archive URI (relative, lang-prefixed) of a post type for a language.
	 */
	private function get_archive_uri(\WP_Post_Type $post_type, string $lang_slug): ?string {
		// The posts archive is the translated posts page when one is set, the
		// language home otherwise (mirrors get_post_type_archive_link() for 'post').
		if ('post' === $post_type->name) {
			$posts_page_id = (int) get_option('page_for_posts');

			if ($posts_page_id) {
				$translated_id = pll_get_post($posts_page_id, $lang_slug);

				return $translated_id ? wp_make_link_relative(get_permalink($translated_id)) : null;
			}

			return wp_make_link_relative(pll_home_url($lang_slug));
		}

		if (empty($post_type->has_archive)) {
			return null;
		}

		$archive_slug = is_string($post_type->has_archive)
			? $post_type->has_archive
			: ($post_type->rewrite['slug'] ?? $post_type->name);

		return wp_make_link_relative(
			trailingslashit(pll_home_url($lang_slug)) . trailingslashit($archive_slug)
		);
	}
}

new RegisterContentTypeTranslations();
