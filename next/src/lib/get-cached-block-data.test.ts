import { cacheTag } from 'next/cache';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { baseUriContext, BaseUriNotDeclaredError } from '@/hooks/use-base-uri';
import getCachedBlockData from '@/lib/get-cached-block-data';

const getData = vi.hoisted(() => vi.fn());

// React only memoises `cache` during a server render: stand in for one render
// per test
const reactRender = vi.hoisted(() => ({ cached: new Map<unknown, unknown>() }));
vi.mock('react', async (importOriginal) => ({
	...(await importOriginal<typeof import('react')>()),
	cache: (fn: () => unknown) => () => {
		if (!reactRender.cached.has(fn)) reactRender.cached.set(fn, fn());
		return reactRender.cached.get(fn);
	},
}));

vi.mock('next/cache', () => ({
	cacheLife: vi.fn(),
	cacheTag: vi.fn(),
}));

vi.mock('@/lib/fetch-api', () => ({ default: vi.fn() }));

vi.mock('@/components/global/blockRegistry', () => ({
	blocksDataList: {
		'core/navigation': async () => ({ getData }),
		'core/terms-query': async () => ({
			getData,
			usesBaseUri: (attrs: { inherit?: boolean }) =>
				attrs.inherit === true,
		}),
	},
}));

afterEach(() => {
	vi.clearAllMocks();
	reactRender.cached = new Map();
});

describe('getCachedBlockData', () => {
	it('keeps every tag of a block returning more than Next takes in one call', async () => {
		const tags = Array.from({ length: 300 }, (_, i) => `node:${i}`);
		getData.mockResolvedValue({ innerBlocks: [], cacheTags: tags });

		await getCachedBlockData('core/navigation', {}, null, null);

		const calls = vi.mocked(cacheTag).mock.calls;
		expect(calls.every((call) => call.length <= 128)).toBe(true);
		expect(calls.flat()).toEqual(['nodes', ...tags]);
	});

	it('declares no dependency for a block returning no tags', async () => {
		getData.mockResolvedValue({ cacheTags: [] });

		await getCachedBlockData('core/navigation', {}, null, null);

		expect(vi.mocked(cacheTag).mock.calls.flat()).toEqual(['nodes']);
	});

	describe('for a block declaring `usesBaseUri` as a function', () => {
		const readsBaseUri = async () => ({
			baseUri: baseUriContext(),
			cacheTags: [],
		});

		it('gives the Base URI to the block when its attributes use it', async () => {
			getData.mockImplementation(readsBaseUri);

			const data = await getCachedBlockData(
				'core/terms-query',
				{ inherit: true },
				null,
				'/category/news/'
			);

			expect(data).toEqual({ baseUri: '/category/news/' });
		});

		it("throws when the block reads the Base URI its attributes don't use", async () => {
			getData.mockImplementation(readsBaseUri);

			await expect(
				getCachedBlockData(
					'core/terms-query',
					{ inherit: false },
					null,
					null
				)
			).rejects.toThrow(BaseUriNotDeclaredError);
		});
	});
});
