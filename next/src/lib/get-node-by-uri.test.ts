import { cacheTag } from 'next/cache';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchAPI, formatBlocksJSON } from '@/lib';
import getBlockFinalComponentProps from '@/lib/get-block-final-component-props';
import getFseTemplates from '@/lib/get-fse-templates';
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

const category = {
	__typename: 'Category',
	id: 7,
	title: 'News',
	uri: '/category/news/',
	fseTemplate: { slug: 'category' },
};

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

	it('tags a page with the page, its type and settings', async () => {
		wordpressReturns({
			__typename: 'Page',
			contentTypeName: 'page',
			id: 12,
			uri: '/about/',
		});

		await getPublicNodeByURI('/about/');

		expect(cacheTagsGiven()).toEqual([
			'node:12',
			'nodes',
			'nodes:page',
			'settings',
		]);
	});

	it('renders a category archive, tagged with its term, its listing and settings', async () => {
		wordpressReturns(category);

		const node = await getPublicNodeByURI('/category/news/');

		expect(node?.uri).toBe('/category/news/');
		expect(cacheTagsGiven()).toEqual([
			'nodes',
			'settings',
			'term:7',
			'type:post',
		]);
	});

	it('renders a tag archive, tagged with its term, its listing and settings', async () => {
		wordpressReturns({
			__typename: 'Tag',
			id: 9,
			title: 'Featured',
			uri: '/tag/featured/',
			fseTemplate: { slug: 'tag' },
		});

		const node = await getPublicNodeByURI('/tag/featured/');

		expect(node?.uri).toBe('/tag/featured/');
		expect(cacheTagsGiven()).toEqual([
			'nodes',
			'settings',
			'term:9',
			'type:post',
		]);
	});

	it('queries the term archive fragments', async () => {
		wordpressReturns(null);

		await getPublicNodeByURI('/category/news/');

		const [query] = vi.mocked(fetchAPI).mock.calls[0];
		expect(query).toContain('...categoryFragment');
		expect(query).toContain('...tagFragment');
	});

	it('gives the archive term to the page and template blocks', async () => {
		wordpressReturns({ ...category, blocksJSON: '[]' });
		vi.mocked(getFseTemplates).mockResolvedValue([
			{
				slug: 'category',
				blocks: [
					{ name: 'core/query', attributes: {}, innerBlocks: [] },
				],
			},
		]);

		await getPublicNodeByURI('/category/news/');

		const context = {
			term: { taxonomy: 'category', databaseId: 7 },
			archive: { postType: 'post' },
		};
		expect(vi.mocked(formatBlocksJSON)).toHaveBeenCalledWith(
			'[]',
			expect.objectContaining({ context })
		);
		expect(vi.mocked(getBlockFinalComponentProps)).toHaveBeenCalledWith(
			expect.objectContaining({ name: 'core/query' }),
			expect.objectContaining({ context })
		);
	});

	it('gives the post type archive to the blocks', async () => {
		wordpressReturns({
			__typename: 'ContentType',
			name: 'event',
			uri: '/events/',
			fseTemplate: { slug: 'archive' },
		});

		await getPublicNodeByURI('/events/');

		expect(vi.mocked(formatBlocksJSON)).toHaveBeenCalledWith(
			'',
			expect.objectContaining({
				context: { archive: { postType: 'event' } },
			})
		);
	});

	it('gives no archive context to a single post', async () => {
		wordpressReturns({
			__typename: 'Post',
			contentTypeName: 'post',
			id: 42,
			uri: '/hello/',
		});

		await getPublicNodeByURI('/hello/');

		expect(vi.mocked(formatBlocksJSON)).toHaveBeenCalledWith(
			'',
			expect.objectContaining({ context: {} })
		);
	});

	it('caches a URI with no node as a 404 tagged `uris`', async () => {
		wordpressReturns(null);

		expect(await getPublicNodeByURI('/nothing/')).toBeNull();
		expect(cacheTagsGiven()).toEqual(['nodes', 'uris']);
	});

	it('caches a node of a type without a fragment as a 404 tagged `uris`', async () => {
		wordpressReturns({ __typename: 'PostFormat' });

		expect(await getPublicNodeByURI('/type/aside/')).toBeNull();
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
