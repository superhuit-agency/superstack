import { afterEach, describe, expect, it, vi } from 'vitest';

import { getData } from '@/components/core/PostNavigationLink/data';
import {
	isWordPressReadError,
	WordPressReadError,
} from '@/lib/wordpress-read-error';

vi.mock('@/hooks/use-base-uri', () => ({
	baseUriContext: () => '/hello-world/',
}));

const currentPost = {
	nodeByUri: {
		__typename: 'Post',
		databaseId: 42,
		date: '2026-05-04T10:00:00',
		categories: { nodes: [] },
		tags: { nodes: [] },
	},
};

const attributes = (
	type: PostNavigationLinkAttributes['type']
): PostNavigationLinkAttributes => ({
	arrow: 'none',
	linkLabel: false,
	showTitle: true,
	taxonomy: '',
	type,
});

describe('PostNavigationLink getData', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('links the adjacent post, tagged with the current one and its type', async () => {
		const fetcher = vi
			.fn()
			.mockResolvedValueOnce(currentPost)
			.mockResolvedValueOnce({
				posts: {
					nodes: [
						{
							databaseId: 43,
							date: '2026-05-05T10:00:00',
							uri: '/next-post/',
							title: 'Next post',
						},
					],
				},
			}) as unknown as FetchApiFuncType;

		await expect(getData(fetcher, attributes('next'))).resolves.toEqual({
			navigationPost: {
				uri: '/next-post/',
				title: 'Next post',
				type: 'next',
			},
			cacheTags: ['node:42', 'type:post'],
		});
	});

	it('fails when the adjacent post read fails, instead of caching another link', async () => {
		const fetcher = vi
			.fn()
			.mockResolvedValueOnce(currentPost)
			.mockRejectedValueOnce(
				new WordPressReadError(
					'PostNavigationLinkAdjacentPost',
					'PostNavigationLinkAdjacentPost'
				)
			) as unknown as FetchApiFuncType;

		const error = await getData(fetcher, attributes('previous')).catch(
			(e) => e
		);

		expect(isWordPressReadError(error)).toBe(true);
		expect(fetcher).toHaveBeenCalledTimes(2);
	});
});
