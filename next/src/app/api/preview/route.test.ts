import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getAuthToken, getPreviewNode } from '@/lib';

const enable = vi.fn();
const cookieStore = vi.hoisted(() => ({ set: vi.fn() }));

vi.mock('next/headers', () => ({
	draftMode: vi.fn(async () => ({ enable })),
	cookies: vi.fn(async () => cookieStore),
}));

vi.mock('next/navigation', () => ({
	redirect: vi.fn(),
}));

vi.mock('@/lib', () => ({
	getAuthToken: vi.fn(async () => 'auth-token'),
	getPreviewNode: vi.fn(async () => ({
		databaseId: 42,
		status: 'draft',
	})),
}));

const SECRET = 'test-secret';

/** A fresh copy of the route, so its log-once state starts over. */
async function loadRoute() {
	vi.resetModules();
	return import('@/app/api/preview/route');
}

function preview(secret: string) {
	return new NextRequest(
		`http://localhost:3000/api/preview/?secret=${secret}&id=42&token=refresh-token`
	);
}

beforeEach(() => {
	vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
	vi.unstubAllEnvs();
	vi.restoreAllMocks();
	vi.clearAllMocks();
});

describe('GET /api/preview', () => {
	it('starts a preview with the configured secret', async () => {
		vi.stubEnv('WORDPRESS_PREVIEW_SECRET', SECRET);
		const route = await loadRoute();

		await route.GET(preview(SECRET));

		expect(vi.mocked(draftMode)).toHaveBeenCalled();
		expect(enable).toHaveBeenCalled();
		expect(vi.mocked(redirect)).toHaveBeenCalledWith('/42/');
	});

	it('keeps the refresh token away from page scripts', async () => {
		vi.stubEnv('WORDPRESS_PREVIEW_SECRET', SECRET);
		const route = await loadRoute();

		await route.GET(preview(SECRET));

		expect(cookieStore.set).toHaveBeenCalledWith(
			'token',
			'refresh-token',
			expect.objectContaining({
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
			})
		);
		// The preview toolbar toggles it
		expect(cookieStore.set).toHaveBeenCalledWith('preview-draft', 'false');
	});

	it('refuses a wrong secret with a 401', async () => {
		vi.stubEnv('WORDPRESS_PREVIEW_SECRET', SECRET);
		const route = await loadRoute();

		const response = await route.GET(preview('wrong'));

		expect(response.status).toBe(401);
		expect(enable).not.toHaveBeenCalled();
	});

	describe('without a configured secret', () => {
		beforeEach(() => {
			vi.stubEnv('WORDPRESS_PREVIEW_SECRET', undefined);
		});

		it.each(['spck', ''])(
			'refuses the secret "%s" with a 401',
			async (secret) => {
				const route = await loadRoute();

				const response = await route.GET(preview(secret));

				expect(response.status).toBe(401);
				expect(vi.mocked(getAuthToken)).not.toHaveBeenCalled();
				expect(vi.mocked(getPreviewNode)).not.toHaveBeenCalled();
				expect(enable).not.toHaveBeenCalled();
			}
		);

		it('logs the missing secret once', async () => {
			const route = await loadRoute();

			await route.GET(preview('spck'));
			await route.GET(preview('spck'));

			expect(console.error).toHaveBeenCalledTimes(1);
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('WORDPRESS_PREVIEW_SECRET is not set')
			);
		});
	});
});
