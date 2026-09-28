import { cacheTag } from 'next/cache';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchAPI } from '@/lib';
import { getPublicNodeByURI } from '@/lib/get-node-by-uri';

const configs = vi.hoisted(() => ({
	isMultilang: false,
	hasCurrentLocaleInLangSwitcher: false,
}));

vi.mock('@/configs.json', () => ({ default: configs }));

vi.mock('next/cache', () => ({
	cacheLife: vi.fn(),
	cacheTag: vi.fn(),
}));

vi.mock('@/lib', () => ({
	fetchAPI: vi.fn(),
	formatBlocksJSON: vi.fn(async () => []),
}));

vi.mock('@/lib/get-fse-templates', () => ({
	default: vi.fn(async () => []),
}));

vi.mock('@/lib/get-block-final-component-props', () => ({
	default: vi.fn(async (block: unknown) => block),
}));

/** Answer the node query with this `node`. */
function wordpressReturns(node: unknown) {
	vi.mocked(fetchAPI).mockResolvedValue({
		node,
		seo: {},
		generalSettings: {},
	});
}

/** Every tag the cached read was given, sorted. */
function cacheTagsGiven() {
	return vi.mocked(cacheTag).mock.calls.flat().sort();
}

beforeEach(() => {
	configs.isMultilang = false;
	configs.hasCurrentLocaleInLangSwitcher = false;
});

afterEach(() => {
	vi.clearAllMocks();
});

describe('getPublicNodeByURI', () => {
	it('tags a post with the post, its type, settings and its terms', async () => {
		wordpressReturns({
			__typename: 'Post',
			contentTypeName: 'post',
			id: 42,
			uri: '/hello/',
			categories: { nodes: [{ databaseId: 7 }] },
			tags: { nodes: [{ databaseId: 9 }] },
		});

		const node = await getPublicNodeByURI('/hello/');

		expect(node?.uri).toBe('/hello/');
		expect(cacheTagsGiven()).toEqual([
			'node:42',
			'nodes',
			'nodes:post',
			'settings',
			'term:7',
			'term:9',
		]);
	});

	it('caches a URI with no node as a 404 tagged `uris`', async () => {
		wordpressReturns(null);

		expect(await getPublicNodeByURI('/nothing/')).toBeNull();
		expect(cacheTagsGiven()).toEqual(['nodes', 'uris']);
	});

	it('caches a term archive, not rendered yet, as a 404 tagged `uris`', async () => {
		wordpressReturns({ __typename: 'Category' });

		expect(await getPublicNodeByURI('/category/news/')).toBeNull();
		expect(cacheTagsGiven()).toEqual(['nodes', 'uris']);
	});

	it('caches a post with no translation in the language as a 404 tagged `uris`', async () => {
		configs.isMultilang = true;
		wordpressReturns({
			__typename: 'Post',
			contentTypeName: 'post',
			translation: null,
		});

		expect(await getPublicNodeByURI('/en/hello/', 'en')).toBeNull();
		expect(cacheTagsGiven()).toEqual(['nodes', 'uris']);
	});
});
