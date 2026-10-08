import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';

import { getDictionary } from '@/i18n/dictionaries';
import { getLocales } from '@/i18n/get-locales';
import { LocaleProvider } from '@/contexts/locale-context';
import { langContext } from '@/hooks/use-lang';

import '@/css/base/index.css';

// Fonts
const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

// Metas
export const viewport: Viewport = {
	themeColor: '#ffffff',
	initialScale: 1,
	width: 'device-width',
};

export const metadata: Metadata = {
	manifest: '/manifest.webmanifest',
};

// In multilang, this is the root layout so that `<html lang>` matches the
// current language (the app root layout has no access to the `lang` param).
export default async function RootLayout({
	params,
	children,
}: {
	children: React.ReactNode;
	params: Promise<{ lang: string }>;
}) {
	const { lang } = await params;

	// Paths with an extension skip the locale proxy, so the first segment
	// may not be a locale (ex: `/llms.txt`)
	const { locales } = await getLocales();
	if (!locales.includes(lang as Locale)) notFound();

	// Lets `not-found.tsx`, which gets no params, render in this language
	langContext(lang);
	const dictionary = await getDictionary(lang as Locale);

	return (
		<html
			lang={lang}
			className={`${geistSans.variable} ${geistMono.variable}`}
		>
			<head>
				<link rel="stylesheet" href="/css/theme-generated.css" />
			</head>
			<body>
				<LocaleProvider locale={lang as Locale} dictionary={dictionary}>
					{children}
				</LocaleProvider>
			</body>
		</html>
	);
}
