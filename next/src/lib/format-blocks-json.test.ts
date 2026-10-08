import { beforeEach, describe, expect, it, vi } from 'vitest';

import formatBlocksJSON from '@/lib/format-blocks-json';
import {
	isWordPressReadError,
	WordPressReadError,
} from '@/lib/wordpress-read-error';

const getData = vi.fn();

vi.mock('@/lib/fetch-api', () => ({ default: vi.fn() }));

// The cached wrapper runs `getData` as is: `use cache` has no meaning here
vi.mock('@/lib/get-cached-block-data', () => ({
	getBlockDataModule: async (name: string) =>
		name === 'test/with-data' ? { getData } : null,
	blockUsesBaseUri: () => false,
	default: async (name: string, attributes: object) =>
		getData(null, attributes),
}));

const blocksJSON = (blocks: unknown[]) => JSON.stringify(blocks);

const withData = (innerBlocks: unknown[] = []) => ({
	name: 'test/with-data',
	attributes: { ref: 1 },
	innerBlocks,
});

const group = (innerBlocks: unknown[]) => ({
	name: 'core/group',
	attributes: {},
	innerBlocks,
});

beforeEach(() => {
	getData.mockReset();
});

describe('formatBlocksJSON', () => {
	it("merges a block's data into its attributes", async () => {
		getData.mockResolvedValue({ label: 'Menu' });

		await expect(
			formatBlocksJSON(blocksJSON([withData()]))
		).resolves.toEqual([
			{
				name: 'test/with-data',
				attributes: { ref: 1, label: 'Menu' },
				innerBlocks: [],
			},
		]);
	});

	it('renders a block with its own attributes when its data fails otherwise', async () => {
		getData.mockRejectedValue(new Error('Malformed data'));

		await expect(
			formatBlocksJSON(blocksJSON([withData()]))
		).resolves.toEqual([
			{ name: 'test/with-data', attributes: { ref: 1 }, innerBlocks: [] },
		]);
	});

	it('fails when a read from WordPress fails', async () => {
		getData.mockRejectedValue(
			new WordPressReadError('the menu 1', 'menu:1')
		);

		const error = await formatBlocksJSON(blocksJSON([withData()])).catch(
			(e) => e
		);

		expect(isWordPressReadError(error)).toBe(true);
	});

	it('fails when a read from WordPress fails in a nested block', async () => {
		getData.mockRejectedValue(
			new WordPressReadError('the menu 1', 'menu:1')
		);

		const error = await formatBlocksJSON(
			blocksJSON([group([group([withData()])])])
		).catch((e) => e);

		expect(isWordPressReadError(error)).toBe(true);
	});

	it('renders a block with its own attributes when a read from WordPress fails in preview', async () => {
		getData.mockRejectedValue(
			new WordPressReadError('the menu 1', 'menu:1')
		);

		await expect(
			formatBlocksJSON(blocksJSON([group([withData()])]), {
				preview: true,
			})
		).resolves.toEqual([
			{
				name: 'core/group',
				attributes: {},
				innerBlocks: [
					{
						name: 'test/with-data',
						attributes: { ref: 1 },
						innerBlocks: [],
					},
				],
			},
		]);
	});
});
