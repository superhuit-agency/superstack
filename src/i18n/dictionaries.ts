import 'server-only';

import { getLocales } from '@/i18n/get-locales';

export const getDictionary = async (locale: Locale) => {
	const { locales, defaultLocale } = await getLocales();

	let dictionnaryToLoad;

	const dictionaries = locales.reduce(
		(acc: Record<Locale, () => Promise<any>>, lang: Locale) => {
			acc[lang] = () =>
				import(`./dictionaries/${lang}.json`)
					.then((module) => module.default)
					.catch(async () => {
						console.warn(
							`Unable to open dictionary for locale "${lang}", falling back to default locale "${defaultLocale}"`
						);

						return await dictionaries[defaultLocale]();
					});
			return acc;
		},
		{}
	);

	if (!dictionaries[locale]) {
		console.warn(
			`Locale "${locale}" was not retrieved from GraphQL. Falling back to default locale "${defaultLocale}". Please make sure the locale is setup correctly in the admin panel.`
		);
		return await dictionaries[defaultLocale]();
	}

	return await dictionaries[locale]();
};

export const getDictionaries = async () => {
	const { locales } = await getLocales();

	// Initialize with empty dictionaries for each locale
	const dictionaries: Record<Locale, any> = locales.reduce(
		(acc: Record<Locale, any>, locale: Locale) => {
			acc[locale] = {};
			return acc;
		},
		{} as Record<Locale, any>
	);

	// Load all dictionaries in parallel
	await Promise.allSettled(
		locales.map(async (locale: Locale) => {
			const dictionary = await import(
				`./dictionaries/${locale}.json`
			).then((module) => module.default);
			dictionaries[locale] = dictionary;
		})
	);

	return dictionaries;
};
