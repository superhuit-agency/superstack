import { cacheTag } from 'next/cache';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchAPI } from '@/lib';
import getSitemapData from '@/lib/get-sitemap-data';

vi.mock('next/cache', () => ({
	cacheLife: vi.fn(),
	cacheTag: vi.fn(),
}));

vi.mock('@/lib', () => ({
	fetchAPI: vi.fn(),
}));

const contentTypes = {
	nodes: [
		{ name: 'post', graphqlSingleName: 'post', graphqlPluralName: 'posts' },
		{
			name: 'feature',
			graphqlSingleName: 'feature',
			graphqlPluralName: 'features',
		},
	],
};

const taxonomies = {
	nodes: [
		{ name: 'category', graphqlPluralName: 'categories' },
		{ name: 'post_format', graphqlPluralName: 'postFormats' },
	],
};

const categories = {
	pageInfo: { hasNextPage: false, endCursor: null },
	nodes: [
		{
			uri: '/category/news/',
			seo: { metaRobotsNoindex: 'index' },
			contentNodes: { nodes: [{ modified: '2026-09-30T10:00:00' }] },
		},
		{
			uri: '/category/hidden/',
			seo: { metaRobotsNoindex: 'noindex' },
			contentNodes: { nodes: [{ modified: '2026-09-29T10:00:00' }] },
		},
	],
};

const featuredImage = {
	node: { sourceUrl: 'https://wp.test/wp-content/uploads/a.jpg', title: 'A' },
};

/**
 * Answer like a WordPress with public introspection off (staging, production):
 * a query asking `__type` or `__schema` is rejected as a whole.
 */
function wordpressWithoutIntrospection() {
	vi.mocked(fetchAPI).mockImplementation(async (query: string) => {
		if (/__type\b|__schema\b/.test(query)) {
			throw new Error(
				'GraphQL introspection is not allowed for public requests'
			);
		}
		if (query.includes('query SitemapTaxonomies')) {
			return { taxonomies };
		}
		if (query.includes('query SitemapTaxonomyUrls')) {
			return { categories };
		}
		if (query.includes('query SitemapTypeUrls')) {
			const type = query.includes('posts(') ? 'posts' : 'features';
			return {
				[type]: {
					edges: [
						{
							node: {
								uri: `/${type}/one/`,
								modified: '2026-09-30T10:00:00',
								...(type === 'posts' ? { featuredImage } : {}),
								seo: { metaRobotsNoindex: 'index' },
							},
						},
					],
				},
			};
		}
		return { contentTypes };
	});
}

afterEach(() => {
	vi.clearAllMocks();
});

describe('getSitemapData', () => {
	it('lists the urls of a type when introspection is off', async () => {
		wordpressWithoutIntrospection();

		const urls = await getSitemapData('features', 1, 100);

		expect(urls).toEqual([
			{
				uri: '/features/one/',
				modified: '2026-09-30',
				images: [],
				seo: { metaRobotsNoindex: 'index' },
			},
		]);
		expect(vi.mocked(cacheTag).mock.calls.flat()).toContain('type:feature');
	});

	it('keeps the featured image of a type that has one', async () => {
		wordpressWithoutIntrospection();

		const urls = await getSitemapData('posts', 1, 100);

		expect(urls?.[0]?.images).toEqual([
			{ uri: '/wp-content/uploads/a.jpg', title: 'A' },
		]);
	});

	it('asks the featured image only of the types that implement it', async () => {
		wordpressWithoutIntrospection();

		await getSitemapData('features', 1, 100);

		const urlsQuery = vi
			.mocked(fetchAPI)
			.mock.calls.map(([query]) => query)
			.find((query) => query.includes('query SitemapTypeUrls'));
		expect(urlsQuery).toMatch(
			/\.\.\. on ContentNode \{\s*\.\.\. on NodeWithFeaturedImage \{\s*featuredImage/
		);
	});

	it('lists the indexable terms of a taxonomy, tagged with it', async () => {
		wordpressWithoutIntrospection();

		const urls = await getSitemapData('categories', 1, 100);

		expect(urls).toEqual([
			{ uri: '/category/news/', modified: '2026-09-30' },
		]);
		expect(vi.mocked(cacheTag).mock.calls.flat()).toEqual(
			expect.arrayContaining(['taxonomy:category', 'content'])
		);
	});

	it('lists the taxonomies with indexable terms in the index', async () => {
		wordpressWithoutIntrospection();
		vi.mocked(fetchAPI).mockImplementation(async (query: string) => {
			if (query.includes('query SitemapTaxonomies'))
				return { taxonomies };
			if (query.includes('query SitemapTaxonomyUrls'))
				return { categories };
			if (query.includes('query TypesNoIndex')) {
				return { seo: { contentTypes: {} } };
			}
			return { contentTypes: { nodes: [] } };
		});

		const index = await getSitemapData('all');

		expect(index).toEqual([
			{ name: 'categories', total: 1, lastModified: '2026-09-30' },
		]);
		expect(vi.mocked(cacheTag).mock.calls.flat()).toContain(
			'taxonomy:category'
		);
	});

	it("doesn't answer an empty taxonomy sitemap when WordPress fails", async () => {
		wordpressWithoutIntrospection();
		const consoleError = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {});
		vi.mocked(fetchAPI).mockImplementation(async (query: string) => {
			if (query.includes('query SitemapTaxonomies'))
				return { taxonomies };
			if (query.includes('query SitemapTaxonomyUrls')) {
				throw new Error('503 Service Unavailable');
			}
			return { contentTypes };
		});

		expect(await getSitemapData('categories', 1, 100)).toBeNull();

		consoleError.mockRestore();
	});
});
