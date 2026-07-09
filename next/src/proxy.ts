import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { NextRequest, NextResponse } from 'next/server';

import configs from '@/configs.json';

// Keep in sync with the languages configured in Polylang (WP admin)
const locales = ['fr'];
const defaultLocale = configs.staticLang;

function getLocale(request: NextRequest) {
	const headers = {
		'accept-language': request.headers.get('accept-language') || '',
	};

	const languages = new Negotiator({ headers }).languages();

	return match(languages, locales, defaultLocale);
}

export function proxy(request: NextRequest) {
	if (!configs.isMultilang) return;

	const { pathname } = request.nextUrl;
	const pathnameHasLocale = locales.some(
		(locale) =>
			pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
	);

	if (pathnameHasLocale) return;

	// Redirect to the default locale of the page if the path is the root or the path is not a locale
	const locale = pathname === '/' ? getLocale(request) : defaultLocale;
	request.nextUrl.pathname = `/${locale}${pathname}`;
	return NextResponse.redirect(request.nextUrl);
}

export const config = {
	matcher: [
		// All paths except Next internals, API routes, proxied WP uploads
		// and static files (anything with an extension)
		'/((?!_next|api|wp-content|.*\\..*).*)',
	],
};
