import { cache } from 'react';

const cachedContext = cache(() => new Map<string, string>());

/**
 * Per-request store for the current language, so segments that don't receive
 * `params` (i.e. `not-found.tsx`) can still resolve the locale. Set by the
 * `[lang]` root layout, which renders before the `not-found.tsx` it wraps.
 * `null` when no language was set, as on a single-language site.
 *
 * Reading the request (headers, pathname) isn't an option: Next renders
 * `not-found.tsx` along with every page, so request data there would make
 * every page dynamic under Cache Components.
 */
export const langContext = (lang?: string) => {
	const cache = cachedContext();

	if (lang) cache.set('lang', lang);

	return (cache.get('lang') ?? null) as Locale | null;
};
