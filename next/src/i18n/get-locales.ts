import configs from '@/configs.json';
import { fetchAPI } from '@/lib';

export const getLocales = async () => {
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
