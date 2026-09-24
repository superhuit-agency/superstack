import { cacheLife, cacheTag } from 'next/cache';

import configs from '@/configs.json';
import { fetchAPI } from '@/lib';
import { cacheTags } from '@/lib/cache-tags';

export const getLocales = async () => {
	'use cache';
	cacheLife('max');
	cacheTag(cacheTags.settings(), cacheTags.nodes());

	if (!configs.isMultilang) {
		return {
			locales: [configs.staticLang as Locale],
			defaultLocale: configs.staticLang as Locale,
		};
	}

	const data = await fetchAPI(
		`
			query locales {
				languages {
					slug
				}
				defaultLanguage {
					slug
				}
			}
		`
	);

	return {
		locales: data.languages.map(
			(lang: { slug: Locale }) => lang.slug
		) as Locale[],
		defaultLocale: data.defaultLanguage.slug as Locale,
	};
};
