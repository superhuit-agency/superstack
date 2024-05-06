import { Metadata, Viewport } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';

import { Footer, MainNav } from '@/components/index';
import { FooterDataType } from '@/components/organisms/Footer';
import { MainNavProps } from '@/components/organisms/MainNav';
import { getWpUriFromNextPath, getAllMenus } from '@/lib';

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
	const menus: MainNavProps & FooterDataType = await getAllMenus();

	const uri = getWpUriFromNextPath(
		params.uri ?? []
		// params.lang,
		// defaultLocale
	);

	const languageCode = 'FR'; // TODO: get from next i18n

	return (
		<html
			lang={languageCode}
			className={`${inter.variable} ${roboto_mono.variable}`}
		>
			<body>
				<div className="app">
					<div className="main">
						<MainNav {...menus} />
						<div>{children}</div>
						<Footer
							{...menus}
							isHome={
								uri === '/' ||
								uri === `/${languageCode.toLowerCase()}/`
							}
						/>
					</div>
				</div>
			</body>
		</html>
	);
}
