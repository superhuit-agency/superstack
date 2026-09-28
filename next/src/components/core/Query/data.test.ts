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
	it('declares that its data changes with the archive', () => {
		expect(usesArchiveContext).toBe(true);
	});

	it('scopes an inheriting loop to the category archive', async () => {
		const { gqlQuery, variables, result } = await queryLoop(
			{ inherit: true, postType: 'post' },
			categoryArchive
		);

		expect(gqlQuery).toContain('QueryPosts');
		expect(variables).toMatchObject({ categoryIn: [7], tagIn: null });
		expect(result.data.posts.nodes).toHaveLength(1);
		expect(result.cacheTags).toEqual(['type:post']);
	});

	it('scopes an inheriting loop to the tag archive', async () => {
		const { variables } = await queryLoop(
			{ inherit: true, postType: 'post' },
			tagArchive
		);

		expect(variables).toMatchObject({ categoryIn: null, tagIn: [9] });
	});

	it("adds the block's own category filter to the archive's", async () => {
		const { variables } = await queryLoop(
			{ inherit: true, taxQuery: { category: ['3'] } },
			categoryArchive
		);

		expect(variables).toMatchObject({ categoryIn: [3, 7] });
	});

	it('leaves a custom loop on a term archive unscoped', async () => {
		const { variables } = await queryLoop(
			{ inherit: false, postType: 'post' },
			categoryArchive
		);

		expect(variables).toMatchObject({ categoryIn: null, tagIn: null });
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
			currentPage: 3,
			totalPages: 2,
		});
	});
});
