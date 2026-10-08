import { afterEach, describe, expect, it, vi } from 'vitest';

import getAllURIs from '@/lib/get-all-uris';
import { WordPressReadError } from '@/lib/wordpress-read-error';

const fetchAPI = vi.hoisted(() => vi.fn());
const configs = vi.hoisted(() => ({
	isMultilang: false,
	staticLang: 'fr',
	hasCurrentLocaleInLangSwitcher: true,
}));

vi.mock('@/lib', () => ({ fetchAPI }));
vi.mock('@/configs.json', () => ({ default: configs }));

const countFailure = () =>
	new WordPressReadError('the "nodeCounts" query', 'nodeCounts');

describe('getAllURIs', () => {
	afterEach(() => {
		configs.isMultilang = false;
		fetchAPI.mockReset();
	});

	describe('on a single-language site', () => {
		it('lists the posts, pages and archives', async () => {
			fetchAPI.mockImplementation(async (query: string) => {
				if (query.includes('nodeCounts')) {
					return {
						pages: { pageInfo: { offsetPagination: { total: 1 } } },
						posts: { pageInfo: { offsetPagination: { total: 2 } } },
					};
				}
				if (query.includes('AllURIs_pages')) {
					return { pages: { nodes: [{ uri: '/about/' }] } };
				}
				if (query.includes('AllURIs_posts')) {
					return {
						posts: {
							nodes: [
								{ uri: '/hello/' },
								{ uri: '/moved/', isRedirected: true },
							],
						},
					};
				}
				return { contentTypes: { nodes: [{ uri: '/blog/' }] } };
			});

			await expect(getAllURIs()).resolves.toEqual([
				{ uri: ['about'] },
				{ uri: ['hello'] },
				{ uri: ['blog'] },
			]);
		});

		it('skips the posts and pages when their count fails, not the build', async () => {
			fetchAPI.mockImplementation(async (query: string) => {
				if (query.includes('nodeCounts')) throw countFailure();
				return { contentTypes: { nodes: [{ uri: '/blog/' }] } };
			});

			await expect(getAllURIs()).resolves.toEqual([{ uri: ['blog'] }]);
		});
	});

	describe('on a multilingual site', () => {
		it('lists each node in its language, archives once per translation', async () => {
			configs.isMultilang = true;
			fetchAPI.mockImplementation(async (query: string) => {
				if (query.includes('nodeCounts')) {
					return {
						pages: { pageInfo: { offsetPagination: { total: 0 } } },
						posts: { pageInfo: { offsetPagination: { total: 1 } } },
						defaultLanguage: { slug: 'en' },
					};
				}
				if (query.includes('AllURIs_posts')) {
					return {
						posts: {
							nodes: [
								{ uri: '/de/hallo/', language: { code: 'DE' } },
								{ uri: '/en/untranslated/', language: null },
							],
						},
					};
				}
				return {
					contentTypes: {
						nodes: [
							{
								uri: '/blog/',
								translations: [
									{
										uri: '/en/blog/',
										language: { code: 'EN' },
									},
									{
										uri: '/de/blog/',
										language: { code: 'DE' },
									},
								],
							},
						],
					},
				};
			});

			await expect(getAllURIs()).resolves.toEqual([
				{ uri: ['hallo'], lang: 'de' },
				{ uri: ['untranslated'], lang: 'en' },
				{ uri: ['blog'], lang: 'en' },
				{ uri: ['blog'], lang: 'de' },
			]);
		});

		it('falls back to the static language when the count fails', async () => {
			configs.isMultilang = true;
			fetchAPI.mockImplementation(async (query: string) => {
				if (query.includes('nodeCounts')) throw countFailure();
				return {
					contentTypes: {
						nodes: [{ uri: '/fr/blog/', translations: null }],
					},
				};
			});

			await expect(getAllURIs()).resolves.toEqual([
				{ uri: ['blog'], lang: 'fr' },
			]);
		});
	});
});
