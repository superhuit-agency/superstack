import { Metadata, Viewport } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';

import { getLocales } from '@/i18n/get-locales';
import { getDictionary } from '@/i18n/dictionaries';

import { LocaleProvider } from '@/contexts/locale-context';

import * as footerData from '@/components/organisms/Footer/data';
import * as mainNavData from '@/components/organisms/MainNav/data';
import { Footer, MainNav } from '@/components/organisms';
import { Gdpr } from '@/components/molecules/Gdpr';

import '@/css/base/index.css';

export const revalidate = 3600; // revalidate the data at most every hour

// Fonts
const inter = Inter({
	subsets: ['latin'],
	variable: '--font-primary',
	display: 'swap',
});
const roboto_mono = Roboto_Mono({
	subsets: ['latin'],
	variable: '--font-secondary',
	display: 'swap',
});

// Metas
export const viewport: Viewport = {
	themeColor: '#ffffff',
	initialScale: 1,
	width: 'device-width',
};

export const metadata: Metadata = {
	manifest: '/manifest.webmanifest',
	// Icons
	// File based api : more info https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons
};

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { defaultLocale } = await getLocales();

	const [navPromise, footerPromise] = await Promise.allSettled([
		mainNavData.getData(defaultLocale),
		footerData.getData(defaultLocale),
	]);

	const mainNavProps =
		navPromise.status === 'fulfilled' ? navPromise.value : null;
	const footerProps =
		footerPromise.status === 'fulfilled' ? footerPromise.value : null;

	const dictionary = await getDictionary(defaultLocale);

	return (
		<html
			lang={defaultLocale} // Will change on locale change in LocaleProvider
			className={`${inter.variable} ${roboto_mono.variable}`}
		>
			<body>
				<div className="app">
					<LocaleProvider
						locale={defaultLocale}
						dictionary={dictionary}
					>
						{mainNavProps ? <MainNav {...mainNavProps} /> : null}
						<div className="main">{children}</div>
						{footerProps ? <Footer {...footerProps} /> : null}
						<Gdpr />
					</LocaleProvider>
				</div>
			</body>
		</html>
	);
}
