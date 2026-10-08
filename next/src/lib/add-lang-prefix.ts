import configs from '@/configs.json';

/**
 * The WordPress URI of a route: on a multilingual site, the route's URI
 * prefixed with its language, e.g. `/de/` for `lang = 'de'` and `uri = '/'`.
 *
 * @param {string}      uri  The URI without its language prefix
 * @param {string|null} lang The language code
 */
export default function addLangPrefix(
	uri: string,
	lang: string | null | undefined
) {
	if (!configs.isMultilang || !lang || uri.startsWith(`/${lang}/`))
		return uri;

	return `/${lang}${uri.startsWith('/') ? '' : '/'}${uri}`;
}
