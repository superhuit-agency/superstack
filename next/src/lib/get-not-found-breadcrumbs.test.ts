import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchAPI } from '@/lib';
import getNotFoundBreadcrumbs from '@/lib/get-not-found-breadcrumbs';

const configs = vi.hoisted(() => ({ isMultilang: false }));

vi.mock('@/configs.json', () => ({ default: configs }));

vi.mock('next/cache', () => ({
	cacheLife: vi.fn(),
	cacheTag: vi.fn(),
}));

vi.mock('@/lib', () => ({ fetchAPI: vi.fn() }));

beforeEach(() => {
	configs.isMultilang = false;
	vi.mocked(fetchAPI).mockResolvedValue({
		seo: {
			breadcrumbs: {
				enabled: true,
				homeText: 'Home',
				notFoundText: 'Not found',
			},
		},
	});
});

describe('getNotFoundBreadcrumbs', () => {
	it('links the home of a single-language site', async () => {
		expect(await getNotFoundBreadcrumbs(null)).toEqual([
			{ text: 'Home', url: '/' },
			{ text: 'Not found', url: '' },
		]);
	});

	it('links the home of the language on a multilingual site', async () => {
		configs.isMultilang = true;

		expect(await getNotFoundBreadcrumbs('de')).toEqual([
			{ text: 'Home', url: '/de/' },
			{ text: 'Not found', url: '' },
		]);
	});
});
