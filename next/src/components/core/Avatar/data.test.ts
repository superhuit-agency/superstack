import { describe, expect, it, vi } from 'vitest';

import { getData } from './data';

describe('core/avatar getData', () => {
	it('renders no avatar without a user, without querying WordPress', async () => {
		const fetcher = vi.fn();

		await expect(
			getData(
				fetcher as unknown as FetchApiFuncType,
				{
					size: 96,
				} as AvatarAttributes
			)
		).resolves.toEqual({ data: {}, cacheTags: [] });
		expect(fetcher).not.toHaveBeenCalled();
	});

	it("reads the user's avatar", async () => {
		const fetcher = vi.fn().mockResolvedValue({
			user: { username: 'jane', avatar: { url: 'https://x/a.png' } },
		});

		await expect(
			getData(
				fetcher as unknown as FetchApiFuncType,
				{
					userId: 3,
				} as AvatarAttributes
			)
		).resolves.toEqual({
			data: { url: 'https://x/a.png', alt: 'jane' },
			cacheTags: [],
		});
		expect(fetcher).toHaveBeenCalledWith(expect.any(String), {
			variables: { userId: 3 },
		});
	});
});
