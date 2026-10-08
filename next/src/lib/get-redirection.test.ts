import { cacheTag } from 'next/cache';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchAPI } from '@/lib';
import getRedirection from '@/lib/get-redirection';

vi.mock('next/cache', () => ({
	cacheLife: vi.fn(),
	cacheTag: vi.fn(),
}));

vi.mock('@/lib', () => ({
	fetchAPI: vi.fn(),
}));

/** Answer the redirections query with these `redirections`. */
function wordpressReturns(redirections: unknown) {
	vi.mocked(fetchAPI).mockResolvedValue({ redirections });
}

afterEach(() => {
	vi.clearAllMocks();
});

describe('getRedirection', () => {
	it.each([[301], [308]])('reads a %i as permanent', async (code) => {
		wordpressReturns([{ code, target: '/new/' }]);

		expect(await getRedirection('/old/')).toEqual({
			destination: '/new/',
			isPermanent: true,
		});
	});

	it.each([[302], [303], [307]])('reads a %i as temporary', async (code) => {
		wordpressReturns([{ code, target: '/new/' }]);

		expect(await getRedirection('/old/')).toEqual({
			destination: '/new/',
			isPermanent: false,
		});
	});

	it.each([
		['none', []],
		['null', null],
	])(
		'finds no redirect when WordPress returns %s',
		async (_, redirections) => {
			wordpressReturns(redirections);

			expect(await getRedirection('/old/')).toBeNull();
		}
	);

	it('tags the lookup `redirects`, so a Purge all expires every cached 404 and redirect', async () => {
		wordpressReturns([]);

		await getRedirection('/Old/');

		expect(cacheTag).toHaveBeenCalledExactlyOnceWith(
			'redirect:/old/',
			'redirects',
			'nodes'
		);
	});

	it('throws when the request failed, so no "no redirect" is cached', async () => {
		vi.mocked(fetchAPI).mockResolvedValue({});

		await expect(getRedirection('/old/')).rejects.toThrow();
	});
});
