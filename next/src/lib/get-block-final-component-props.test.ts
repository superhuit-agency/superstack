import { afterEach, describe, expect, it, vi } from 'vitest';

import getBlockFinalComponentProps from '@/lib/get-block-final-component-props';
import getCachedBlockData, {
	getBlockDataModule,
	type BlockDataModule,
} from '@/lib/get-cached-block-data';

vi.mock('@/lib/get-cached-block-data', () => ({
	default: vi.fn(async () => ({})),
	getBlockDataModule: vi.fn(),
}));

vi.mock('@/lib/fetch-api', () => ({ default: vi.fn() }));

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
		vi.mocked(getCachedBlockData).mockResolvedValue({
			innerBlocks: [pagination],
		});

		const props = await render();

		expect(props.innerBlocks).toEqual([pagination]);
		expect(getBlockDataModule).toHaveBeenCalledWith(
			'core/query-pagination-next'
		);
	});
});
