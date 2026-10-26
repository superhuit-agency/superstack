import { describe, expect, it, vi } from 'vitest';

import {
	AUTH_TOKEN_COOKIE,
	getAuthTokenMaxAge,
	setAuthTokenCookie,
} from '@/lib/preview-auth-token';

const jwt = (payload: object) =>
	[
		'header',
		Buffer.from(JSON.stringify(payload)).toString('base64url'),
		'signature',
	].join('.');

const now = Date.UTC(2026, 0, 1);
const nowInSeconds = now / 1000;

describe('getAuthTokenMaxAge', () => {
	it('keeps the token until shortly before it expires', () => {
		expect(getAuthTokenMaxAge(jwt({ exp: nowInSeconds + 300 }), now)).toBe(
			270
		);
	});

	it('drops a token about to expire', () => {
		expect(getAuthTokenMaxAge(jwt({ exp: nowInSeconds + 10 }), now)).toBe(
			0
		);
	});

	it('drops an expired token', () => {
		expect(getAuthTokenMaxAge(jwt({ exp: nowInSeconds - 1 }), now)).toBe(0);
	});

	it('drops a token without expiry', () => {
		expect(getAuthTokenMaxAge(jwt({}), now)).toBe(0);
	});

	it('drops a malformed token', () => {
		expect(getAuthTokenMaxAge('not-a-jwt', now)).toBe(0);
	});
});

describe('setAuthTokenCookie', () => {
	it('sets an httpOnly cookie expiring with the token', () => {
		const cookies = { set: vi.fn() };
		const authToken = jwt({ exp: Date.now() / 1000 + 300 });

		setAuthTokenCookie(cookies, authToken);

		expect(cookies.set).toHaveBeenCalledWith(
			AUTH_TOKEN_COOKIE,
			authToken,
			expect.objectContaining({
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				maxAge: expect.any(Number),
			})
		);
	});

	it('marks the cookie secure in production', () => {
		vi.stubEnv('NODE_ENV', 'production');
		const cookies = { set: vi.fn() };

		setAuthTokenCookie(cookies, jwt({ exp: Date.now() / 1000 + 300 }));

		expect(cookies.set).toHaveBeenCalledWith(
			AUTH_TOKEN_COOKIE,
			expect.any(String),
			expect.objectContaining({ secure: true })
		);
		vi.unstubAllEnvs();
	});

	it('sets no cookie for an expired token', () => {
		const cookies = { set: vi.fn() };

		setAuthTokenCookie(cookies, jwt({ exp: Date.now() / 1000 - 1 }));

		expect(cookies.set).not.toHaveBeenCalled();
	});
});
