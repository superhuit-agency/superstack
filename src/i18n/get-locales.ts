import configs from '@/configs.json';
import fetchAPI from '../lib/fetch-api';

export const getLocales = async () => {
	if (!configs.isMultilang) {
		return {
			locales: [configs.staticLang],
			defaultLocale: configs.staticLang,
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
		locales: data.languages.map((lang: { slug: Locale }) => lang.slug),
		defaultLocale: data.defaultLanguage.slug,
	};
};
