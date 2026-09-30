import { describe, expect, it, vi } from 'vitest';

import { getData, usesArchiveContext } from './data';

const categoryArchive: BlockDataContext = {
	term: { taxonomy: 'category', databaseId: 7 },
	archive: { postType: 'post' },
};

const tagArchive: BlockDataContext = {
	term: { taxonomy: 'tag', databaseId: 9 },
	archive: { postType: 'post' },
};

const eventArchive: BlockDataContext = { archive: { postType: 'event' } };

/** Run the block's `getData`, returning its result and the query it sent. */
async function queryLoop(
	query: QueryType,
	context: BlockDataContext = {},
	connection: 'posts' | 'contentNodes' = 'posts'
) {
	const fetcher = vi.fn(async () => ({
		[connection]: {
			pageInfo: { offsetPagination: { total: 3 } },
			nodes: [{ id: 'a', databaseId: 1, uri: '/a/' }],
		},
	}));

	const result = await getData(
		fetcher as unknown as FetchApiFuncType,
		{ query } as QueryAttributes,
		null,
		context
	);
	const [gqlQuery, { variables }] = fetcher.mock.calls[0] as unknown as [
		string,
		{ variables: Record<string, unknown> },
	];

	return { result, gqlQuery, variables };
}

describe('core/query getData', () => {
	it('declares that only an inheriting loop changes with the archive', () => {
		expect(usesArchiveContext({ query: { inherit: true } })).toBe(true);
		expect(usesArchiveContext({ query: { inherit: false } })).toBe(false);
		expect(usesArchiveContext({})).toBe(false);
	});

	it('scopes an inheriting loop to the category archive', async () => {
		const { gqlQuery, variables, result } = await queryLoop(
			{ inherit: true, postType: 'post' },
			categoryArchive
		);

		expect(gqlQuery).toContain('QueryPosts');
		expect(variables).toMatchObject({
			categoryId: 7,
			categoryIn: null,
			tagIn: null,
		});
		expect(result.data.posts.nodes).toHaveLength(1);
		expect(result.cacheTags).toEqual(['type:post']);
	});

	it('scopes an inheriting loop to the tag archive', async () => {
		const { variables } = await queryLoop(
			{ inherit: true, postType: 'post' },
			tagArchive
		);

		expect(variables).toMatchObject({
			categoryId: null,
			categoryIn: null,
			tagIn: [9],
		});
	});

	it("ignores the block's own taxonomy filters in an inheriting loop", async () => {
		const { variables } = await queryLoop(
			{ inherit: true, taxQuery: { category: ['3'], post_tag: ['4'] } },
			categoryArchive
		);

		expect(variables).toMatchObject({
			categoryId: 7,
			categoryIn: null,
			tagIn: null,
		});
	});

	it("applies a custom loop's own category and tag filters", async () => {
		const { variables } = await queryLoop(
			{ inherit: false, taxQuery: { category: ['3'], post_tag: ['4'] } },
			categoryArchive
		);

		expect(variables).toMatchObject({
			categoryId: null,
			categoryIn: [3],
			tagIn: [4],
		});
	});

	it('scopes an inheriting loop to a custom term archive of posts', async () => {
		const { gqlQuery, variables, result } = await queryLoop(
			{ inherit: true },
			{
				term: { taxonomy: 'genre', databaseId: 11 },
				archive: { postType: 'post' },
			},
			'contentNodes'
		);

		expect(gqlQuery).toContain('QueryContentNodes');
		expect(variables).toMatchObject({
			contentTypes: ['POST'],
			taxTermIn: [11],
		});
		expect(result.cacheTags).toEqual(['type:post']);
	});

	it('leaves a custom loop on a term archive unscoped', async () => {
		const { variables } = await queryLoop(
			{ inherit: false, postType: 'post' },
			categoryArchive
		);

		expect(variables).toMatchObject({
			categoryId: null,
			categoryIn: null,
			tagIn: null,
		});
	});

	it('lists the post type archive in an inheriting loop', async () => {
		const { gqlQuery, variables, result } = await queryLoop(
			{ inherit: true, postType: 'post' },
			eventArchive,
			'contentNodes'
		);

		expect(gqlQuery).toContain('QueryContentNodes');
		expect(variables).toMatchObject({ contentTypes: ['EVENT'] });
		expect(result.data.posts.nodes).toHaveLength(1);
		expect(result.cacheTags).toEqual(['type:event']);
	});

	it("lists a custom loop's own post type", async () => {
		const { variables, result } = await queryLoop(
			{ inherit: false, postType: 'page' },
			eventArchive,
			'contentNodes'
		);

		expect(variables).toMatchObject({ contentTypes: ['PAGE'] });
		expect(result.cacheTags).toEqual(['type:page']);
	});

	it("keeps the block's offset", async () => {
		const { variables, result } = await queryLoop({
			perPage: 2,
			offset: 4,
		});

		expect(variables).toMatchObject({ first: 2, offset: 4 });
		expect(result.pagination).toMatchObject({
			currentPage: 1,
			totalPages: 2,
		});
	});

	it('follows the route page in an inheriting loop, on top of its offset', async () => {
		const { variables, result } = await queryLoop(
			{ inherit: true, perPage: 2, offset: 1 },
			{ page: 2 }
		);

		expect(variables).toMatchObject({ first: 2, offset: 3 });
		expect(result.pagination).toMatchObject({ currentPage: 2 });
	});

	it('keeps a custom loop on its first page', async () => {
		const { variables, result } = await queryLoop(
			{ inherit: false, perPage: 2 },
			{ page: 2 }
		);

		expect(variables).toMatchObject({ offset: 0 });
		expect(result.pagination).toMatchObject({ currentPage: 1 });
	});

	it('injects the pagination into its pagination blocks', async () => {
		const { result } = await queryLoop(
			{ inherit: true, perPage: 1 },
			{
				page: 2,
				baseUri: '/blog/',
				innerBlocks: [
					{
						name: 'core/query-pagination',
						attributes: {},
						innerBlocks: [
							{
								name: 'core/query-pagination-previous',
								attributes: {},
								innerBlocks: [],
							},
							{
								name: 'core/query-pagination-next',
								attributes: {},
								innerBlocks: [],
							},
						],
					},
				],
			}
		);

		const [previous, next] = result.innerBlocks![0].innerBlocks;
		expect(previous.attributes).toMatchObject({
			href: '/blog/',
			isDisabled: false,
		});
		expect(next.attributes).toMatchObject({
			href: '/blog/page/3/',
			isDisabled: false,
		});
	});
});
