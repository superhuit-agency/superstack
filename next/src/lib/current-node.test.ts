import { describe, expect, it, vi } from 'vitest';

import * as postAuthor from '@/components/core/PostAuthor/data';
import * as postAuthorName from '@/components/core/PostAuthorName/data';
import * as postDate from '@/components/core/PostDate/data';
import * as postFeaturedImage from '@/components/core/PostFeaturedImage/data';
import * as postNavigationLink from '@/components/core/PostNavigationLink/data';
import * as postTerms from '@/components/core/PostTerms/data';
import * as postTitle from '@/components/core/PostTitle/data';
import * as queryTitle from '@/components/core/QueryTitle/data';
import * as termName from '@/components/core/TermName/data';
import * as termsQuery from '@/components/core/TermsQuery/data';
import { currentNodeQuery } from '@/lib/current-node';

vi.mock('@/hooks/use-base-uri', () => ({
	baseUriContext: vi.fn(() => '/category/news/'),
}));

const fetcherReturning = (response: unknown) =>
	vi.fn(async () => response) as unknown as FetchApiFuncType;

const termArchive = {
	generalSettings: { dateFormat: 'd.m.Y' },
	nodeByUri: {
		__typename: 'Category',
		termDatabaseId: 7,
		termName: 'News',
		termUri: '/category/news/',
		taxonomyName: 'category',
	},
};

const post = {
	generalSettings: { dateFormat: 'd.m.Y' },
	nodeByUri: {
		__typename: 'Post',
		databaseId: 12,
		title: 'Hello',
		date: '2026-01-01T10:00:00',
		modified: '2026-01-02T10:00:00',
		uri: '/hello/',
		author: { node: { name: 'Ada', avatar: { url: '/ada.png' } } },
		categories: {
			nodes: [{ databaseId: 3, name: 'A', uri: '/category/a/' }],
		},
		tags: { nodes: [{ databaseId: 5, name: 'B', uri: '/tag/b/' }] },
	},
};

const blocks: Record<string, (fetcher: FetchApiFuncType) => Promise<unknown>> =
	{
		'core/post-author': (fetcher) => postAuthor.getData(fetcher),
		'core/post-author-name': (fetcher) => postAuthorName.getData(fetcher),
		'core/post-date': (fetcher) => postDate.getData(fetcher),
		'core/post-featured-image': (fetcher) =>
			postFeaturedImage.getData(fetcher),
		'core/post-navigation-link': (fetcher) =>
			postNavigationLink.getData(fetcher),
		'core/post-terms': (fetcher) =>
			postTerms.getData(fetcher, {
				term: 'category',
			} as PostTermsAttributes),
		'core/post-title': (fetcher) => postTitle.getData(fetcher),
		'core/query-title': (fetcher) => queryTitle.getData(fetcher),
		'core/term-name': (fetcher) => termName.getData(fetcher),
	};

describe('blocks reading the node at the Base URI', () => {
	it.each(Object.entries(blocks))(
		'%s sends the shared query',
		async (_, getData) => {
			const fetcher = fetcherReturning(termArchive);

			await getData(fetcher);

			expect(fetcher).toHaveBeenCalledTimes(1);
			expect(fetcher).toHaveBeenCalledWith(currentNodeQuery, {
				variables: { uri: '/category/news/' },
			});
		}
	);

	it('core/terms-query reads the archive it inherits with the shared query', async () => {
		const fetcher = fetcherReturning(termArchive);

		await termsQuery.getData(fetcher, {
			termQuery: { inherit: true, taxonomy: 'category' },
		} as TermsQueryAttributes);

		expect(fetcher).toHaveBeenNthCalledWith(1, currentNodeQuery, {
			variables: { uri: '/category/news/' },
		});
	});

	it("doesn't tag a post block with a term's ID on a term archive", async () => {
		const data = await postTitle.getData(fetcherReturning(termArchive));

		expect(data.cacheTags).toEqual(['uris']);
	});

	it('names and tags the term being viewed', async () => {
		const data = await termName.getData(fetcherReturning(termArchive));

		expect(data).toEqual({
			content: 'News',
			uri: '/category/news/',
			cacheTags: ['term:7'],
		});
	});

	it('names no term on a post', async () => {
		const data = await termName.getData(fetcherReturning(post));

		expect(data).toEqual({ content: '', uri: null, cacheTags: ['uris'] });
	});

	it('titles the term archive with its term', async () => {
		const data = await queryTitle.getData(fetcherReturning(termArchive), {
			type: 'archive',
			showPrefix: false,
		} as QueryTitleAttributes);

		expect(data).toEqual({ content: 'News', cacheTags: ['term:7'] });
	});

	it('titles an author archive with the user name', async () => {
		const data = await queryTitle.getData(
			fetcherReturning({
				nodeByUri: { __typename: 'User', userName: 'Ada' },
			}),
			{ type: 'archive', showPrefix: false } as QueryTitleAttributes
		);

		expect(data).toEqual({ content: 'Ada', cacheTags: [] });
	});

	it('titles no archive on a post', async () => {
		const data = await queryTitle.getData(fetcherReturning(post), {
			type: 'archive',
			showPrefix: false,
		} as QueryTitleAttributes);

		expect(data).toEqual({ content: '', cacheTags: [] });
	});

	it("lists only a post's categories in a categories block", async () => {
		const data = await postTerms.getData(fetcherReturning(post), {
			term: 'category',
		} as PostTermsAttributes);

		expect(data.categories).toEqual(post.nodeByUri.categories.nodes);
		expect(data.tags).toBeUndefined();
		expect(data.cacheTags).toEqual(['node:12', 'term:3']);
	});

	it("lists only a post's tags in a tags block", async () => {
		const data = await postTerms.getData(fetcherReturning(post), {
			term: 'post_tag',
		} as PostTermsAttributes);

		expect(data.categories).toBeUndefined();
		expect(data.tags).toEqual(post.nodeByUri.tags.nodes);
		expect(data.cacheTags).toEqual(['node:12', 'term:5']);
	});

	it("reads a post's title, date and author from the shared query", async () => {
		const fetcher = fetcherReturning(post);

		expect(await postTitle.getData(fetcher)).toEqual({
			content: 'Hello',
			cacheTags: ['node:12'],
		});
		expect(await postAuthorName.getData(fetcher)).toMatchObject({
			name: 'Ada',
			cacheTags: ['node:12'],
		});
		expect(await postDate.getData(fetcher)).toMatchObject({
			machineDatetime: '2026-01-01T10:00:00',
			permalink: '/hello/',
			phpDatePattern: 'd.m.Y',
			cacheTags: ['node:12', 'settings'],
		});
	});
});
