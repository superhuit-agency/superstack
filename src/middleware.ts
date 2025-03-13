import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { NextRequest, NextResponse } from 'next/server';

import configs from '@/configs.json';

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
	if (!configs.isMultilang) return; // Bail early if multilang is disabled

	// Check if there is any supported locale in the pathname
	const { pathname } = request.nextUrl;
	const pathnameHasLocale = locales.some(
		(locale) =>
			pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
	);

	if (pathnameHasLocale) return;

	// Redirect if there is no locale
	const locale = getLocale(request);
	request.nextUrl.pathname = `/${locale}${pathname}`;
	return NextResponse.redirect(request.nextUrl);
}

export const config = {
	matcher: [
		// Skip all internal paths (_next)
		'/((?!_next).*)',
		// Only run on root (/) URL
		'/',
	],
};
