import { cacheTag } from 'next/cache';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { baseUriContext } from '@/hooks/use-base-uri';
import { fetchAPI, formatBlocksJSON } from '@/lib';
import getBlockFinalComponentProps from '@/lib/get-block-final-component-props';
import getFseTemplates from '@/lib/get-fse-templates';
import {
	getPreviewNodeByURI,
	getPublicNodeByURI,
} from '@/lib/get-node-by-uri';

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

vi.mock('@/hooks/use-base-uri', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/hooks/use-base-uri')>()),
	baseUriContext: vi.fn(),
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

/** The query and variables the node was read with. */
function nodeRead() {
	const [query, { variables }] = vi.mocked(fetchAPI).mock.calls[0] as [
		string,
		{ variables: Record<string, unknown> },
	];

	return { query, variables };
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

	it('tags a child page with its ancestors, whose titles and URIs its breadcrumbs display', async () => {
		wordpressReturns({
			__typename: 'Page',
			contentTypeName: 'page',
			id: 14,
			uri: '/about/team/jobs/',
			ancestors: { nodes: [{ databaseId: 13 }, { databaseId: 12 }] },
		});

		await getPublicNodeByURI('/about/team/jobs/');

		expect(cacheTagsGiven()).toEqual([
			'node:12',
			'node:13',
			'node:14',
			'nodes',
			'nodes:page',
			'settings',
		]);
	});

	it("queries a page's ancestors", async () => {
		wordpressReturns(null);

		await getPublicNodeByURI('/about/team/');

		const [query] = vi.mocked(fetchAPI).mock.calls[0];
		expect(query.replace(/\s+/g, ' ')).toContain(
			'ancestors(first: 100) { nodes { databaseId } }'
		);
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
			page: 1,
			baseUri: '/category/news/',
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
				context: {
					page: 1,
					baseUri: '/events/',
					archive: { postType: 'event' },
				},
			})
		);
	});

	it('gives only the page to a single post', async () => {
		wordpressReturns({
			__typename: 'Post',
			contentTypeName: 'post',
			id: 42,
			uri: '/hello/',
		});

		await getPublicNodeByURI('/hello/', null, 3);

		expect(vi.mocked(formatBlocksJSON)).toHaveBeenCalledWith(
			'',
			expect.objectContaining({
				context: { page: 3, baseUri: '/hello/' },
			})
		);
	});

	describe('on a `/page/{n}` route', () => {
		const inheritingLoop = (totalPages: number | null) => ({
			name: 'core/query',
			attributes: {
				query: { inherit: true },
				pagination: { totalPages },
			},
			innerBlocks: [],
		});

		/** A template whose content area holds `blocks`. */
		const templateWith = (...blocks: unknown[]) =>
			vi.mocked(getFseTemplates).mockResolvedValue([
				{
					slug: 'category',
					blocks: [
						{
							name: 'core/group',
							attributes: {},
							innerBlocks: blocks,
						},
					],
				},
			] as Awaited<ReturnType<typeof getFseTemplates>>);

		afterEach(() => {
			vi.mocked(getFseTemplates).mockResolvedValue([]);
		});

		it('renders a page of the loop inheriting the template query', async () => {
			wordpressReturns(category);
			templateWith(inheritingLoop(3));

			const node = await getPublicNodeByURI('/category/news/', null, 3);

			expect(node?.uri).toBe('/category/news/');
		});

		it('renders a page of a loop whose total is unknown', async () => {
			wordpressReturns(category);
			templateWith(inheritingLoop(null));

			expect(
				await getPublicNodeByURI('/category/news/', null, 9)
			).not.toBeNull();
		});

		it('caches a page past the last one as a 404, tagged with the archive', async () => {
			wordpressReturns(category);
			templateWith(inheritingLoop(3));

			expect(
				await getPublicNodeByURI('/category/news/', null, 4)
			).toBeNull();
			expect(cacheTagsGiven()).toEqual([
				'nodes',
				'settings',
				'term:7',
				'type:post',
			]);
		});

		it('caches a page of a node with no inheriting loop as a 404, tagged with the node', async () => {
			wordpressReturns({
				__typename: 'Post',
				contentTypeName: 'post',
				id: 42,
				uri: '/hello/',
				fseTemplate: { slug: 'category' },
			});
			templateWith({
				name: 'core/query',
				attributes: {
					query: { inherit: false },
					pagination: { totalPages: 5 },
				},
				innerBlocks: [],
			});

			expect(await getPublicNodeByURI('/hello/', null, 2)).toBeNull();
			expect(cacheTagsGiven()).toEqual([
				'node:42',
				'nodes',
				'nodes:post',
				'settings',
			]);
		});

		it('renders the first page of a node with no loop', async () => {
			wordpressReturns({
				__typename: 'Post',
				contentTypeName: 'post',
				id: 42,
				uri: '/hello/',
			});

			expect(await getPublicNodeByURI('/hello/', null, 1)).not.toBeNull();
		});
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

	it('tags a translated node `uris`, since it links to its translations', async () => {
		configs.isMultilang = true;
		wordpressReturns({
			__typename: 'Page',
			contentTypeName: 'page',
			translation: {
				id: 12,
				uri: '/en/about/',
				language: { code: 'EN', locale: 'en_US' },
				translations: [
					{
						uri: '/fr/a-propos/',
						language: { code: 'FR', locale: 'fr_FR' },
					},
				],
			},
		});

		const node = await getPublicNodeByURI('/about/', 'en');

		expect(node?.translations).toEqual([
			{
				uri: '/fr/a-propos/',
				language: { code: 'FR', locale: 'fr_FR' },
			},
		]);
		expect(cacheTagsGiven()).toEqual([
			'node:12',
			'nodes',
			'nodes:page',
			'settings',
			'uris',
		]);
	});

	it('tags a node with no translation yet `uris`, since publishing one adds a link', async () => {
		configs.isMultilang = true;
		wordpressReturns({
			__typename: 'Page',
			contentTypeName: 'page',
			translation: {
				id: 12,
				uri: '/en/about/',
				language: { code: 'EN', locale: 'en_US' },
				translations: [],
			},
		});

		await getPublicNodeByURI('/about/', 'en');

		expect(cacheTagsGiven()).toContain('uris');
	});

	it('gives the blocks the Base URI with its language prefix', async () => {
		configs.isMultilang = true;
		wordpressReturns({
			__typename: 'Page',
			contentTypeName: 'page',
			translation: {
				id: 582,
				uri: '/de/',
				language: { code: 'DE', locale: 'de_CH' },
				fseTemplate: { slug: 'front-page' },
			},
		});

		await getPublicNodeByURI('/', 'de');

		expect(vi.mocked(baseUriContext)).toHaveBeenLastCalledWith('/de/');
	});
});

describe('reading a node by its database ID', () => {
	const auth = { authToken: 'token' };

	it.each(['/2024/05/my-post/', '/42/'])(
		'reads the public %s by its URI',
		async (uri) => {
			wordpressReturns(null);

			await getPublicNodeByURI(uri);

			const { query, variables } = nodeRead();
			expect(query).toContain('nodeByUri(uri: $uri)');
			expect(variables).toEqual({
				isPreview: false,
				isPreviewDraft: false,
				uri,
			});
		}
	);

	it('reads a preview of `/{id}/` by its ID', async () => {
		wordpressReturns(null);

		await getPreviewNodeByURI('/42/', null, 1, auth, true);

		const { query, variables } = nodeRead();
		expect(query).toContain('node(id: $id, idType: DATABASE_ID)');
		expect(variables).toEqual({
			isPreview: true,
			isPreviewDraft: true,
			id: 42,
		});
	});

	it('reads a preview of `/{lang}/{id}/` by its ID', async () => {
		configs.isMultilang = true;
		wordpressReturns(null);

		await getPreviewNodeByURI('/42/', 'fr', 1, auth, true);

		expect(nodeRead().variables).toMatchObject({ id: 42 });
	});

	it('reads a preview of a date permalink by its URI', async () => {
		wordpressReturns(null);

		await getPreviewNodeByURI('/2024/05/my-post/', null, 1, auth, false);

		expect(nodeRead().variables).toEqual({
			isPreview: true,
			isPreviewDraft: false,
			uri: '/2024/05/my-post/',
		});
	});
});
