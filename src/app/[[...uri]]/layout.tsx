import { Metadata, Viewport } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';

import { Gdpr } from '@/components/molecules/Gdpr';
import { Footer, MainNav } from '@/components/organisms';
import * as footerData from '@/components/organisms/Footer/data';
import * as mainNavData from '@/components/organisms/MainNav/data';
import { getWpUriFromNextPath } from '@/lib';

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
	params,
	children,
}: {
	children: React.ReactNode;
	params: { uri: string[] };
}) {
	const uri = getWpUriFromNextPath(
		params.uri ?? []
		// params.lang,
		// defaultLocale
	);

	const [navPromise, footerPromise] = await Promise.allSettled([
		mainNavData.getData(uri),
		footerData.getData(uri),
	]);

	const mainNavProps =
		navPromise.status === 'fulfilled' ? navPromise.value : null;
	const footerProps =
		footerPromise.status === 'fulfilled' ? footerPromise.value : null;

	const languageCode = 'FR'; // TODO: get from next i18n

	return (
		<html
			lang={languageCode}
			className={`${inter.variable} ${roboto_mono.variable}`}
		>
			<body>
				<div className="app">
					<div className="main">
						{mainNavProps && <MainNav {...mainNavProps} />}
						<div>{children}</div>
						{footerProps && <Footer {...footerProps} />}
						<Gdpr />
					</div>
				</div>
			</body>
		</html>
	);
}
