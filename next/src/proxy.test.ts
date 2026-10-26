import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import configs from '@/configs.json';
import getAuthToken from '@/lib/get-auth-token';
import { AUTH_TOKEN_COOKIE } from '@/lib/preview-auth-token';
import { proxy } from '@/proxy';

vi.mock('@/lib/get-auth-token', () => ({ default: vi.fn() }));

vi.mock('@/configs.json', () => ({
	default: { isMultilang: false, staticLang: 'fr' },
}));

const authToken = [
	'header',
	Buffer.from(JSON.stringify({ exp: Date.now() / 1000 + 300 })).toString(
		'base64url'
	),
	'signature',
].join('.');

const request = (cookie: string, path = '/42/') =>
	new NextRequest(`http://localhost:3000${path}`, { headers: { cookie } });

describe.each([
	{ isMultilang: false, path: '/42/' },
	{ isMultilang: true, path: '/fr/42/' },
])('proxy, in preview (isMultilang: $isMultilang)', ({ isMultilang, path }) => {
	beforeEach(() => {
		configs.isMultilang = isMultilang;
		vi.mocked(getAuthToken).mockReset();
	});

	it('sets a fresh auth token when there is none', async () => {
		vi.mocked(getAuthToken).mockResolvedValue(authToken);

		const response = await proxy(
			request('__prerender_bypass=1; token=refresh', path)
		);

		expect(getAuthToken).toHaveBeenCalledWith('refresh');
		expect(response?.cookies.get(AUTH_TOKEN_COOKIE)).toMatchObject({
			value: authToken,
			httpOnly: true,
			sameSite: 'lax',
			path: '/',
		});
	});

	it('keeps a still-valid auth token', async () => {
		const response = await proxy(
			request(
				`__prerender_bypass=1; token=refresh; ${AUTH_TOKEN_COOKIE}=${authToken}`,
				path
			)
		);

		expect(getAuthToken).not.toHaveBeenCalled();
		expect(response).toBeUndefined();
	});

	it('exits preview mode when the refresh token is invalid', async () => {
		vi.mocked(getAuthToken).mockResolvedValue(false);

		const response = await proxy(
			request('__prerender_bypass=1; token=invalid', path)
		);

		expect(response?.headers.get('location')).toBe(
			`http://localhost:3000/api/preview-exit/?redirect=${encodeURIComponent(path)}`
		);
	});

	it('refreshes nothing outside preview', async () => {
		const response = await proxy(request('token=refresh', path));

		expect(getAuthToken).not.toHaveBeenCalled();
		expect(response).toBeUndefined();
	});
});
