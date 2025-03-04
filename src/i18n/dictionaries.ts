import 'server-only';

import { getLocales } from '@/i18n/get-locales';

export const getDictionary = async (locale: Locale) => {
	const { locales } = await getLocales();

	const dictionaries = locales.reduce(
		(acc: Record<Locale, () => Promise<any>>, lang: Locale) => {
			acc[lang] = () =>
				import(`./dictionaries/${lang}.json`).then(
					(module) => module.default
				);
			return acc;
		},
		{}
	);

	const dictionary = await dictionaries[locale]();

	return dictionary;
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
	await Promise.all(
		locales.map(async (locale: Locale) => {
			const dictionary = await import(
				`./dictionaries/${locale}.json`
			).then((module) => module.default);
			dictionaries[locale] = dictionary;
		})
	);

	return dictionaries;
};
