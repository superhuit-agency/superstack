import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as route from '@/app/api/sitemap/route';
import { getSitemapData } from '@/lib';

vi.mock('@/lib', () => ({
	getSitemapData: vi.fn(),
}));

const ORIGIN = 'https://example.test';

function get(path: string) {
	return route.GET(new NextRequest(`${ORIGIN}${path}`));
}

beforeEach(() => {
	vi.stubEnv('NEXT_URL', ORIGIN);
});

afterEach(() => {
	vi.unstubAllEnvs();
	vi.clearAllMocks();
});

describe('GET /api/sitemap', () => {
	describe('when WordPress fails', () => {
		it.each([
			['the index', '/sitemap.xml'],
			['a type sitemap', '/sitemap-posts.xml'],
			['a type sitemap page', '/sitemap-posts-2.xml'],
		])(
			'answers 503 for %s, so crawlers retry and keep its urls',
			async (_, path) => {
				vi.mocked(getSitemapData).mockResolvedValue(null);

				const response = await get(path);

				expect(response.status).toBe(503);
				expect(
					Number(response.headers.get('Retry-After'))
				).toBeGreaterThan(0);
				expect(response.headers.get('Cache-Control')).toBe('no-store');
				expect(await response.text()).not.toMatch(
					/<urlset|<sitemapindex/
				);
			}
		);
	});

	it('answers 200 with an empty urlset for a type with no urls', async () => {
		vi.mocked(getSitemapData).mockResolvedValue([]);

		const response = await get('/sitemap-nope.xml');

		expect(response.status).toBe(200);
		expect(await response.text()).toMatch(/<urlset[^>]*>\s*<\/urlset>/);
	});

	it('lists the types in the index', async () => {
		vi.mocked(getSitemapData).mockResolvedValue([
			{ name: 'posts', total: 1, lastModified: '2026-09-30' },
		]);

		const response = await get('/sitemap.xml');

		expect(getSitemapData).toHaveBeenCalledWith('all', 1, 1000);
		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toBe(
			'text/xml; charset=UTF-8'
		);
		expect(response.headers.get('Cache-Control')).toBe('max-age=3600');
		expect(response.headers.has('Retry-After')).toBe(false);
		expect(await response.text()).toContain(
			`<loc>${ORIGIN}/sitemap-posts.xml</loc>`
		);
	});

	it('lists the urls of a type', async () => {
		vi.mocked(getSitemapData).mockResolvedValue([
			{ uri: '/hello/', modified: '2026-09-30' },
		]);

		const response = await get('/sitemap-posts-2.xml');

		expect(getSitemapData).toHaveBeenCalledWith('posts', 2, 1000);
		expect(response.status).toBe(200);
		expect(response.headers.get('Cache-Control')).toBe('max-age=3600');
		expect(await response.text()).toContain(`<loc>${ORIGIN}/hello/</loc>`);
	});
});
