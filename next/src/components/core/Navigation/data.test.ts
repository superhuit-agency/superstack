import { describe, expect, it, vi } from 'vitest';

import { getData } from '@/components/core/Navigation/data';
import { isWordPressReadError } from '@/lib/wordpress-read-error';

const fetcherReturning = (response: unknown) =>
	vi.fn(async () => response) as unknown as FetchApiFuncType;

describe('Navigation getData', () => {
	it('returns the menu items, tagged with the menu', async () => {
		const items = [{ name: 'core/navigation-link', attributes: {} }];
		const fetcher = fetcherReturning({
			navigationMenu: { blocksJSON: JSON.stringify(items) },
		});

		await expect(getData(fetcher, { ref: 12 })).resolves.toEqual({
			submenuVisibility: 'hover',
			innerBlocks: items,
			cacheTags: ['menu:12'],
		});
	});

	it('renders a menu that does not exist as empty, tagged with the menu', async () => {
		const fetcher = fetcherReturning({ navigationMenu: null });

		await expect(getData(fetcher, { ref: 12 })).resolves.toEqual({
			submenuVisibility: 'hover',
			innerBlocks: [],
			cacheTags: ['menu:12'],
		});
	});

	it('throws a WordPressReadError when the menu read fails', async () => {
		// fetchAPI resolves to `{}` on a network, HTTP or GraphQL error
		const fetcher = fetcherReturning({});

		const error = await getData(fetcher, { ref: 12 }).catch((e) => e);

		expect(isWordPressReadError(error)).toBe(true);
	});

	it('does not read WordPress without a menu reference', async () => {
		const fetcher = fetcherReturning({});

		await expect(getData(fetcher, {})).resolves.toEqual({
			submenuVisibility: 'hover',
			innerBlocks: [],
			cacheTags: [],
		});
		expect(fetcher).not.toHaveBeenCalled();
	});
});
