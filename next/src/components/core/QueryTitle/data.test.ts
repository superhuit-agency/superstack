import { describe, expect, it, vi } from 'vitest';

import { getData } from './data';

vi.mock('@/hooks/use-base-uri', () => ({
	baseUriContext: vi.fn(() => '/search/'),
}));

describe('core/query-title getData', () => {
	it('titles the search results on a relative Base URI', async () => {
		const fetcher = vi.fn();

		const result = await getData(
			fetcher as unknown as FetchApiFuncType,
			{
				type: 'search',
			} as QueryTitleAttributes
		);

		expect(result).toEqual({ content: 'Search results', cacheTags: [] });
		expect(fetcher).not.toHaveBeenCalled();
	});
});
