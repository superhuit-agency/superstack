'use client';

import { createContext, useContext, useEffect } from 'react';

interface LocaleContextType {
	locale: Locale;
	dictionary: Dictionary;
}

export const LocaleContext = createContext<LocaleContextType>({
	locale: 'fr',
	dictionary: {},
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
	/**
	 * Update document language on locale change
	 */
	useEffect(() => {
		document.documentElement.lang = locale;
	}, [locale]);

	return (
		<LocaleContext.Provider value={{ locale, dictionary }}>
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
