'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import defaultDictionary from '@/i18n/dictionaries/fr.json';

interface Translation {
	uri: string;
	language: {
		code: string;
		locale: string;
	};
}

interface LocaleContextType {
	locale: Locale;
	dictionary: Dictionary;
	translations: Translation[];
	setTranslations: (t: Translation[]) => void;
}

export const LocaleContext = createContext<LocaleContextType>({
	locale: 'fr',
	dictionary: defaultDictionary,
	translations: [],
	setTranslations: () => {},
});

export function LocaleProvider({
	locale,
	dictionary,
	children,
}: {
	locale: Locale;
	dictionary: Dictionary;
	children: React.ReactNode;
}) {
	const [translations, setTranslations] = useState<Translation[]>([]);

	useEffect(() => {
		document.documentElement.lang = locale;
	}, [locale]);

	return (
		<LocaleContext.Provider
			value={{ locale, dictionary, translations, setTranslations }}
		>
			{children}
		</LocaleContext.Provider>
	);
}

export function useLocale() {
	const context = useContext(LocaleContext);
	if (!context) {
		throw new Error('useLocale hook must be used within a LocaleProvider');
	}
	return context;
}
