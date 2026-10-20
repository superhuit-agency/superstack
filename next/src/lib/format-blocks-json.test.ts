import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	BaseUriNotDeclaredError,
	isBaseUriNotDeclaredError,
} from '@/hooks/use-base-uri';
import formatBlocksJSON from '@/lib/format-blocks-json';
import { WordPressReadError } from '@/lib/wordpress-read-error';

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

const withData = (innerBlocks: unknown[] = [], ref = 1) => ({
	name: 'test/with-data',
	attributes: { ref },
	innerBlocks,
});

const group = (innerBlocks: unknown[]) => ({
	name: 'core/group',
	attributes: {},
	innerBlocks,
});

const errors = [
	['a plain Error', new Error('Malformed data')],
	[
		'a TypeError',
		new TypeError("Cannot read properties of null (reading 'title')"),
	],
	['a WordPressReadError', new WordPressReadError('the menu 1', 'menu:1')],
] as const;

/** The block with `ref: 1` fails with `error`, any other gets a label. */
const failFirstBlock = (error: Error) =>
	getData.mockImplementation(async (_fetcher, attrs: { ref: number }) => {
		if (attrs.ref === 1) throw error;
		return { label: `Menu ${attrs.ref}` };
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

	it.each(errors)(
		"fails when a block's data fails with %s",
		async (_, error) => {
			failFirstBlock(error);

			await expect(
				formatBlocksJSON(blocksJSON([withData(), withData([], 2)]))
			).rejects.toBe(error);
		}
	);

	it.each(errors)(
		"fails when a nested block's data fails with %s",
		async (_, error) => {
			failFirstBlock(error);

			await expect(
				formatBlocksJSON(blocksJSON([group([group([withData()])])]))
			).rejects.toBe(error);
		}
	);

	it.each(errors)(
		'renders a block with its own attributes when its data fails with %s in preview',
		async (_, error) => {
			failFirstBlock(error);

			await expect(
				formatBlocksJSON(
					blocksJSON([group([withData(), withData([], 2)])]),
					{ preview: true }
				)
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
						{
							name: 'test/with-data',
							attributes: { ref: 2, label: 'Menu 2' },
							innerBlocks: [],
						},
					],
				},
			]);
		}
	);

	it.each([false, true])(
		'fails when a block reads the Base URI without declaring it (preview: %s)',
		async (preview) => {
			failFirstBlock(new BaseUriNotDeclaredError('test/with-data'));

			const error = await formatBlocksJSON(
				blocksJSON([group([withData()]), withData([], 2)]),
				{ preview }
			).catch((e) => e);

			expect(isBaseUriNotDeclaredError(error)).toBe(true);
		}
	);
});
