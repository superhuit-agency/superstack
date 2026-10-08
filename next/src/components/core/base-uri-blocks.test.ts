import { describe, expect, it, vi } from 'vitest';

import * as postAuthor from './PostAuthor/data';
import * as postAuthorName from './PostAuthorName/data';
import * as postDate from './PostDate/data';
import * as postExcerpt from './PostExcerpt/data';
import * as postFeaturedImage from './PostFeaturedImage/data';
import * as postNavigationLink from './PostNavigationLink/data';
import * as postTerms from './PostTerms/data';
import * as postTimeToRead from './PostTimeToRead/data';
import * as postTitle from './PostTitle/data';
import * as queryTitle from './QueryTitle/data';
import * as termName from './TermName/data';
import * as termsQuery from './TermsQuery/data';

// No Base URI: the `/_not-found` prerender, or a 404 rendered before the page sets it
vi.mock('@/hooks/use-base-uri', () => ({
	baseUriContext: vi.fn(() => undefined),
}));

type DataModule = {
	getData: (fetcher: FetchApiFuncType, attrs?: any) => Promise<unknown>;
};

const blocks: Array<[string, DataModule, object]> = [
	['core/post-author', postAuthor, {}],
	['core/post-author-name', postAuthorName, {}],
	['core/post-date', postDate, {}],
	['core/post-excerpt', postExcerpt, {}],
	['core/post-featured-image', postFeaturedImage, {}],
	['core/post-navigation-link', postNavigationLink, { type: 'next' }],
	['core/post-terms', postTerms, { term: 'category' }],
	['core/post-time-to-read', postTimeToRead, {}],
	['core/post-title', postTitle, {}],
	['core/query-title', queryTitle, { type: 'archive' }],
	['core/term-name', termName, {}],
];

describe('Page-dependent blocks without a Base URI', () => {
	it.each(blocks)(
		'%s renders empty without querying WordPress',
		async (_name, { getData }, attrs) => {
			const fetcher = vi.fn();

			const data = await getData(
				fetcher as unknown as FetchApiFuncType,
				attrs
			);

			expect(fetcher).not.toHaveBeenCalled();
			expect(data).toMatchObject({ cacheTags: expect.any(Array) });
		}
	);

	it('core/terms-query inheriting the archive lists the top-level terms instead', async () => {
		const fetcher = vi.fn().mockResolvedValue({ terms: { nodes: [] } });

		await termsQuery.getData(
			fetcher as unknown as FetchApiFuncType,
			{
				termQuery: { inherit: true },
			} as TermsQueryAttributes
		);

		expect(fetcher).toHaveBeenCalledTimes(1);
		expect(fetcher.mock.calls[0][1].variables.where).toMatchObject({
			taxonomies: ['CATEGORY'],
			parent: 0,
		});
	});
});
