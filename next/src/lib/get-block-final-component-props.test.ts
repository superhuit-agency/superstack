import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as termsQuery from '@/components/core/TermsQuery/data';
import { baseUriContext } from '@/hooks/use-base-uri';
import getBlockFinalComponentProps from '@/lib/get-block-final-component-props';
import getCachedBlockData, {
	getBlockDataModule,
	type BlockDataModule,
} from '@/lib/get-cached-block-data';

vi.mock('@/lib/get-cached-block-data', async (importOriginal) => ({
	...(await importOriginal<typeof import('@/lib/get-cached-block-data')>()),
	default: vi.fn(async () => ({})),
	getBlockDataModule: vi.fn(),
}));

vi.mock('@/lib/fetch-api', () => ({ default: vi.fn() }));

// React only memoises `cache` during a server render: stand in for one render
// per test
const reactRender = vi.hoisted(() => ({ cached: new Map<unknown, unknown>() }));
vi.mock('react', async (importOriginal) => ({
	...(await importOriginal<typeof import('react')>()),
	cache: (fn: () => unknown) => () => {
		if (!reactRender.cached.has(fn)) reactRender.cached.set(fn, fn());
		return reactRender.cached.get(fn);
	},
}));

const context: BlockDataContext = {
	page: 2,
	baseUri: '/category/news/',
	term: { taxonomy: 'category', databaseId: 7 },
	archive: { postType: 'post' },
};

/** The context a block using it gets: the page's, plus its own innerBlocks. */
const blockContext = { ...context, innerBlocks: [] };

function blockModuleIs(blockModule: BlockDataModule) {
	vi.mocked(getBlockDataModule).mockResolvedValue(blockModule);
}

const render = (preview = false) =>
	getBlockFinalComponentProps(
		{ name: 'core/query', attributes: {}, innerBlocks: [] },
		{ lang: null, preview, context }
	);

afterEach(() => {
	vi.clearAllMocks();
	reactRender.cached = new Map();
});

describe('getBlockFinalComponentProps', () => {
	it('keys the block data by the archive for a block using it', async () => {
		blockModuleIs({ getData: vi.fn(), usesArchiveContext: true });

		await render();

		expect(vi.mocked(getCachedBlockData)).toHaveBeenCalledWith(
			'core/query',
			{},
			null,
			null,
			blockContext
		);
	});

	it("keeps the archive out of other blocks' cache key", async () => {
		blockModuleIs({ getData: vi.fn() });

		await render();

		expect(vi.mocked(getCachedBlockData)).toHaveBeenCalledWith(
			'core/query',
			{},
			null,
			null,
			undefined
		);
	});

	it("keeps the archive out of the key when the block's attributes don't use it", async () => {
		const usesArchiveContext = vi.fn(() => false);
		blockModuleIs({ getData: vi.fn(), usesArchiveContext });

		await render();

		expect(usesArchiveContext).toHaveBeenCalledWith({});
		expect(vi.mocked(getCachedBlockData)).toHaveBeenCalledWith(
			'core/query',
			{},
			null,
			null,
			undefined
		);
	});

	it.each([
		[true, '/category/news/'],
		[false, null],
	])(
		'keys a terms query by the Base URI only when it inherits (inherit: %s)',
		async (inherit, baseUri) => {
			blockModuleIs(termsQuery);
			baseUriContext('/category/news/');
			const attributes = { termQuery: { inherit } };

			await getBlockFinalComponentProps(
				{ name: 'core/terms-query', attributes, innerBlocks: [] },
				{ lang: null }
			);

			expect(vi.mocked(getCachedBlockData)).toHaveBeenCalledWith(
				'core/terms-query',
				attributes,
				null,
				baseUri,
				undefined
			);
		}
	);

	it('gives the archive to a block using it in preview', async () => {
		const getData = vi.fn(async () => ({}));
		blockModuleIs({ getData, usesArchiveContext: true });

		await render(true);

		expect(getData).toHaveBeenCalledWith(
			expect.anything(),
			{},
			null,
			blockContext
		);
		expect(vi.mocked(getCachedBlockData)).not.toHaveBeenCalled();
	});

	it('enriches the innerBlocks returned by getData', async () => {
		const pagination = {
			name: 'core/query-pagination-next',
			attributes: { href: '/blog/page/2/' },
			innerBlocks: [],
		};
		vi.mocked(getBlockDataModule).mockImplementation(async (name) =>
			name === 'core/query'
				? { getData: vi.fn(), usesArchiveContext: true }
				: null
		);
		vi.mocked(getCachedBlockData).mockResolvedValueOnce({
			innerBlocks: [pagination],
		});

		const props = await render();

		expect(props.innerBlocks).toEqual([pagination]);
		expect(getBlockDataModule).toHaveBeenCalledWith(
			'core/query-pagination-next'
		);
	});

	describe('on a cold cache', () => {
		beforeEach(() => {
			blockModuleIs({ getData: vi.fn() });
		});

		it('reads the data of identical blocks once per render', async () => {
			const siteTitle = {
				name: 'core/site-title',
				attributes: {},
				innerBlocks: [],
			};

			await Promise.all([
				getBlockFinalComponentProps(siteTitle, { lang: 'en' }),
				getBlockFinalComponentProps({ ...siteTitle }, { lang: 'en' }),
			]);

			expect(vi.mocked(getCachedBlockData)).toHaveBeenCalledTimes(1);
		});

		it('reads blocks with different cache keys separately', async () => {
			const siteTitle = {
				name: 'core/site-title',
				attributes: {},
				innerBlocks: [],
			};

			await Promise.all([
				getBlockFinalComponentProps(siteTitle, { lang: 'en' }),
				getBlockFinalComponentProps(siteTitle, { lang: 'fr' }),
				getBlockFinalComponentProps(
					{ ...siteTitle, attributes: { level: 2 } },
					{ lang: 'en' }
				),
			]);

			expect(vi.mocked(getCachedBlockData)).toHaveBeenCalledTimes(3);
		});

		it('gives every identical block the failure of their shared read', async () => {
			vi.mocked(getCachedBlockData).mockRejectedValueOnce(
				new Error('WordPress is down')
			);
			const siteTitle = {
				name: 'core/site-title',
				attributes: {},
				innerBlocks: [],
			};

			const results = await Promise.all([
				getBlockFinalComponentProps(siteTitle, { lang: 'en' }),
				getBlockFinalComponentProps({ ...siteTitle }, { lang: 'en' }),
			]);

			expect(vi.mocked(getCachedBlockData)).toHaveBeenCalledTimes(1);
			// Not a WordPressReadError: both fall back to their own attributes
			expect(results).toEqual([
				{ name: 'core/site-title', attributes: {}, innerBlocks: [] },
				{ name: 'core/site-title', attributes: {}, innerBlocks: [] },
			]);
		});
	});
});
