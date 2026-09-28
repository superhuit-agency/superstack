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
	term: { taxonomy: 'category', databaseId: 7 },
	archive: { postType: 'post' },
};

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
			context
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
			null
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
			context
		);
		expect(vi.mocked(getCachedBlockData)).not.toHaveBeenCalled();
	});
});
