import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { NextRequest, NextResponse } from 'next/server';

import { getAppConfigs } from '@/lib/config';

const locales = ['en'];
const defaultLocale = 'en';

// Get the preferred locale of the user depending its browser language preferences
function getLocale(request: NextRequest) {
	const headers = {
		'accept-language': request.headers.get('accept-language') || '',
	};

	const languages = new Negotiator({ headers }).languages();

	return match(languages, locales, defaultLocale);
}

export function middleware(request: NextRequest) {
	const configs = getAppConfigs();

	if (configs.isMultilang) {
		// Check if there is any supported locale in the pathname
		const { pathname } = request.nextUrl;
		const pathnameHasLocale = locales.some(
			(locale) =>
				pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
		);

		if (!pathnameHasLocale) {
			// Redirect if there is no locale
			const locale = getLocale(request);
			request.nextUrl.pathname = `/${locale}${pathname}`;
			return NextResponse.redirect(request.nextUrl);
		}
	}

	if (
		request.nextUrl.pathname.startsWith('/_next') ||
		request.nextUrl.pathname.startsWith('/api')
	) {
		return NextResponse.next();
	}

	// MULTISITE region from domain
	if (configs.multisite) {
		const host = request.headers.get('host') || '';

		const site = configs.multisite.find(
			(site: MultisiteConfig) => site.domain === host
		);
		if (site) {
			const response = NextResponse.next();

			response.cookies.set('region', site.region);
			return response;
		}
	}

	return NextResponse.next();
}

//  Run middleware on all routes
// export const config = {
// 	matcher: [
// 		// Only run on root (/) URL
// 		'/',
// 	],
// };
