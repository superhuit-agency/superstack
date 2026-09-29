<?php

namespace Superstack\GraphQL\CurrentLanguageFromUri;

if (! defined('ABSPATH')) {
	exit;
}

add_filter('graphql_pre_resolve_uri', __NAMESPACE__ . '\set_current_language', 10, 2);

/**
 * Sets Polylang's current language from the language prefix of a resolved URI.
 *
 * GraphQL requests run in the admin context (`PLL_Admin`), where Polylang never
 * sets a current language — only the frontend does, from the requested URL. Every
 * link filter of Polylang (`post_type_archive_link` among them) then bails out,
 * so post type archive links, and the Yoast canonical / OG url built on top of
 * them, come back unprefixed and identical in every language.
 *
 * Translated content nodes are unaffected: their permalink carries the language
 * of the post itself. Only language-less nodes — the ContentType archives — rely
 * on the current language.
 *
 * @param  mixed|null $node The node resolved so far, if any.
 * @param  ?string     $uri The uri being searched.
 * @return mixed|null
 */
function set_current_language($node, $uri) {
	if (null !== $node) return $node;

	if (! function_exists('PLL') || ! PLL() || ! isset(PLL()->model)) return $node;

	$slug = get_uri_language_slug($uri);

	if (! $slug) return $node;

	$language = PLL()->model->get_language($slug);

	if ($language) {
		PLL()->curlang = $language;

		// Setting `curlang` alone does not swap the user strings translations:
		// Polylang loads them into `$GLOBALS['l10n']['pll_string']` on the
		// `pll_language_defined` action, which only the frontend fires. Without
		// this the `pll__()` calls of the Yoast integration — the breadcrumbs
		// home label among them — keep returning the default language string.
		PLL()->load_strings_translations($language->slug);

		set_translate_slugs_language($language);
	}

	return $node;
}

/**
 * Hands the current language to Polylang Pro's translated slugs module.
 *
 * The module keeps its own copy of the current language, taken by reference
 * from `$polylang->curlang` on the frontend but — in the admin context GraphQL
 * requests run in — from a local variable its loader fills once, at a point
 * where no language is set yet (`translate-slugs/load.php`). Assigning
 * `PLL()->curlang` therefore never reaches it, and every slug filter it
 * registers, `post_type_archive_link` among them, bails out on an empty
 * language and returns the default language slugs.
 *
 * @access private
 * @param  \PLL_Language $language The language to set.
 * @return void
 */
function set_translate_slugs_language($language) {
	if (! isset(PLL()->translate_slugs)) return;

	PLL()->translate_slugs->curlang = $language;
}

/**
 * Extracts the language slug from the first segment of a URI, when it is one.
 *
 * Only meaningful when Polylang prefixes URLs with the language (`force_lang` 1);
 * with a domain or subdomain per language there is no prefix to read.
 *
 * @param  ?string $uri The uri being searched.
 * @return ?string      The language slug, or null when the URI carries none.
 */
function get_uri_language_slug($uri) {
	if (! function_exists('pll_languages_list')) return null;

	$path = trim((string) wp_parse_url((string) $uri, PHP_URL_PATH), '/');

	if ('' === $path) return null;

	$first = explode('/', $path)[0];

	return in_array($first, pll_languages_list(['fields' => 'slug']), true) ? $first : null;
}
