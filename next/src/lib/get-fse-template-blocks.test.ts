import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	BaseUriNotDeclaredError,
	isBaseUriNotDeclaredError,
} from '@/hooks/use-base-uri';
import { enrichTemplateBlocks } from '@/lib/get-fse-template-blocks';

const getData = vi.fn();

vi.mock('@/lib/fetch-api', () => ({ default: vi.fn() }));
vi.mock('@/lib/get-fse-templates', () => ({ default: vi.fn() }));

// The cached wrapper runs `getData` as is: `use cache` has no meaning here
vi.mock('@/lib/get-cached-block-data', () => ({
	getBlockDataModule: async (name: string) =>
		name === 'test/with-data' ? { getData } : null,
	blockUsesBaseUri: () => false,
	default: async (name: string, attributes: object) =>
		getData(null, attributes),
}));

const header = {
	name: 'test/with-data',
	attributes: { ref: 1 },
	innerBlocks: [],
};
const footer = {
	name: 'test/with-data',
	attributes: { ref: 2 },
	innerBlocks: [],
};

/** The header fails with `error`, the footer gets a label. */
const failHeader = (error: Error) =>
	getData.mockImplementation(async (_fetcher, attrs: { ref: number }) => {
		if (attrs.ref === 1) throw error;
		return { label: `Menu ${attrs.ref}` };
	});

beforeEach(() => {
	getData.mockReset();
});

describe('enrichTemplateBlocks', () => {
	it("fails the public render when a template block's data fails", async () => {
		failHeader(new TypeError('Not a menu'));

		await expect(
			enrichTemplateBlocks([header, footer], { lang: null })
		).rejects.toThrow('Not a menu');
	});

	it('renders a template block with its own attributes when its data fails in preview', async () => {
		failHeader(new TypeError('Not a menu'));

		await expect(
			enrichTemplateBlocks([header, footer], {
				lang: null,
				preview: true,
			})
		).resolves.toEqual([
			header,
			{ ...footer, attributes: { ref: 2, label: 'Menu 2' } },
		]);
	});

	it.each([false, true])(
		'fails when a template block reads the Base URI without declaring it (preview: %s)',
		async (preview) => {
			failHeader(new BaseUriNotDeclaredError('test/with-data'));

			const error = await enrichTemplateBlocks([header, footer], {
				lang: null,
				preview,
			}).catch((e) => e);

			expect(isBaseUriNotDeclaredError(error)).toBe(true);
		}
	);
});
