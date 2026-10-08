import { cacheTag } from 'next/cache';
import { afterEach, describe, expect, it, vi } from 'vitest';

import getCachedBlockData from '@/lib/get-cached-block-data';

const getData = vi.hoisted(() => vi.fn());

vi.mock('next/cache', () => ({
	cacheLife: vi.fn(),
	cacheTag: vi.fn(),
}));

vi.mock('@/lib/fetch-api', () => ({ default: vi.fn() }));

vi.mock('@/components/global/blockRegistry', () => ({
	blocksDataList: {
		'core/navigation': async () => ({ getData }),
	},
}));

afterEach(() => {
	vi.clearAllMocks();
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
});
