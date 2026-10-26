import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { NextRequest, NextResponse } from 'next/server';

import configs from '@/configs.json';
import getAuthToken from '@/lib/get-auth-token';
import {
	AUTH_TOKEN_COOKIE,
	setAuthTokenCookie,
} from '@/lib/preview-auth-token';

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

// Refresh the preview's auth token once it expired: the page reads it from
// the cookies of the request, a Server Component render can't set it.
async function refreshPreviewAuthToken(request: NextRequest) {
	const { cookies } = request;
	const refreshToken = cookies.get('token')?.value;

	if (
		!cookies.has('__prerender_bypass') ||
		!refreshToken ||
		cookies.has(AUTH_TOKEN_COOKIE)
	)
		return;

	const authToken = await getAuthToken(refreshToken);

	// Exit preview mode if refresh token is invalid, as the page would
	if (!authToken) {
		const exitUrl = new URL('/api/preview-exit/', request.url);
		exitUrl.searchParams.set('redirect', request.nextUrl.pathname);

		return NextResponse.redirect(exitUrl);
	}

	const response = NextResponse.next();
	setAuthTokenCookie(response.cookies, authToken);

	return response;
}

export async function proxy(request: NextRequest) {
	if (!configs.isMultilang) return refreshPreviewAuthToken(request);

	const { pathname } = request.nextUrl;
	const pathnameHasLocale = locales.some(
		(locale) =>
			pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
	);

	if (pathnameHasLocale) return refreshPreviewAuthToken(request);

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
