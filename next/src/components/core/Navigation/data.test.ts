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
		expect(error.digest).toBe('WORDPRESS_READ_FAILED:menu:12');
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

	it('is tagged with the posts and terms its links are bound to, nested ones included', async () => {
		const boundTo = (source: string) => ({
			bindings: { url: { source, args: { field: 'link' } } },
		});
		const items = [
			{
				name: 'core/navigation-link',
				attributes: {
					kind: 'post-type',
					id: 243,
					metadata: boundTo('core/post-data'),
				},
				innerBlocks: [],
			},
			{
				name: 'core/navigation-submenu',
				attributes: {
					kind: 'post-type',
					id: 7,
					metadata: boundTo('core/post-data'),
				},
				innerBlocks: [
					{
						name: 'core/navigation-link',
						attributes: {
							kind: 'taxonomy',
							id: 5,
							metadata: boundTo('core/term-data'),
						},
						innerBlocks: [],
					},
					{
						name: 'core/navigation-link',
						attributes: {
							kind: 'post-type',
							id: 243,
							metadata: boundTo('core/post-data'),
						},
						innerBlocks: [],
					},
				],
			},
		];
		const fetcher = fetcherReturning({
			navigationMenu: { blocksJSON: JSON.stringify(items) },
		});

		const { cacheTags } = await getData(fetcher, { ref: 12 });

		expect(cacheTags).toEqual(['menu:12', 'node:243', 'node:7', 'term:5']);
	});

	it('is not tagged with the post of a link whose URL is not bound to it', async () => {
		const items = [
			{
				name: 'core/navigation-link',
				attributes: { kind: 'post-type', id: 243, url: '/stored/' },
				innerBlocks: [],
			},
			{
				name: 'core/navigation-link',
				attributes: { kind: 'custom', url: 'https://example.com/' },
				innerBlocks: [],
			},
		];
		const fetcher = fetcherReturning({
			navigationMenu: { blocksJSON: JSON.stringify(items) },
		});

		const { cacheTags } = await getData(fetcher, { ref: 12 });

		expect(cacheTags).toEqual(['menu:12']);
	});
});
