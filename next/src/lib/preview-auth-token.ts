import type { NextResponse } from 'next/server';

export const AUTH_TOKEN_COOKIE = 'auth-token';

// Leaves the render reading the cookie time to send the token to WordPress
const EXPIRY_MARGIN = 30;

/**
 * Seconds the auth token stays usable, from its JWT `exp` claim.
 * Its signature isn't checked here: WordPress checks it on every read.
 *
 * @param authToken The auth token returned by `refreshJwtAuthToken`
 * @param now       The current time, in milliseconds
 */
export const getAuthTokenMaxAge = (authToken: string, now = Date.now()) => {
	try {
		const payload = authToken.split('.')[1] ?? '';
		const { exp } = JSON.parse(
			Buffer.from(payload, 'base64url').toString()
		);

		if (typeof exp !== 'number') return 0;

		return Math.max(0, Math.floor(exp - now / 1000) - EXPIRY_MARGIN);
	} catch {
		return 0;
	}
};

/**
 * Keeps the preview's auth token until it expires, so it isn't refreshed
 * on every preview request. Set by the preview route and the proxy only:
 * a Server Component render can't set cookies.
 *
 * @param cookies   The cookies of the response
 * @param authToken The auth token returned by `refreshJwtAuthToken`
 */
export const setAuthTokenCookie = (
	cookies: Pick<NextResponse['cookies'], 'set'>,
	authToken: string
) => {
	const maxAge = getAuthTokenMaxAge(authToken);
	if (!maxAge) return;

	cookies.set(AUTH_TOKEN_COOKIE, authToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge,
	});
};
