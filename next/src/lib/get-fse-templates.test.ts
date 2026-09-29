import { beforeEach, describe, expect, it, vi } from 'vitest';

import fetchAPI from '@/lib/fetch-api';
import getFseTemplates from '@/lib/get-fse-templates';

vi.mock('next/cache', () => ({
	cacheLife: vi.fn(),
	cacheTag: vi.fn(),
}));

vi.mock('@/lib/fetch-api', () => ({ default: vi.fn() }));

vi.mock('@/lib/format-blocks-json', () => ({
	default: vi.fn(async (blocksJSON: string) =>
		blocksJSON ? JSON.parse(blocksJSON) : []
	),
}));

const part = (slug: string) => ({
	name: 'core/template-part',
	attributes: { slug },
	innerBlocks: [],
});
const paragraph = (content: string) => ({
	name: 'core/paragraph',
	attributes: { content },
	innerBlocks: [],
});
const group = (...innerBlocks: unknown[]) => ({
	name: 'core/group',
	attributes: {},
	innerBlocks,
});

/** Answer the templates query with one `page` template and these parts. */
function wordpressReturns(templateBlocks: unknown[], parts: unknown[]) {
	vi.mocked(fetchAPI).mockResolvedValue({
		allTemplates: [
			{ slug: 'page', blocksJSON: JSON.stringify(templateBlocks) },
		],
		allTemplateParts: parts,
	});
}

async function pageTemplateBlocks() {
	const templates = await getFseTemplates();
	return (templates.find((template) => template.slug === 'page')?.blocks ??
		[]) as BlockPropsType[];
}

beforeEach(() => {
	vi.mocked(fetchAPI).mockReset();
});

describe('getFseTemplates', () => {
	it('inlines a template part wrapped in another block', async () => {
		wordpressReturns(
			[group(part('header'))],
			[
				{
					slug: 'header',
					area: 'header',
					blocksJSON: JSON.stringify([paragraph('Logo')]),
				},
			]
		);

		const [wrapper] = await pageTemplateBlocks();

		expect(wrapper.innerBlocks[0]).toMatchObject({
			attributes: { slug: 'header', area: 'header' },
			innerBlocks: [paragraph('Logo')],
		});
	});

	it('inlines a template part included by another template part', async () => {
		wordpressReturns(
			[part('footer')],
			[
				{
					slug: 'footer',
					blocksJSON: JSON.stringify([part('credits')]),
				},
				{
					slug: 'credits',
					blocksJSON: JSON.stringify([paragraph('©')]),
				},
			]
		);

		const [footer] = await pageTemplateBlocks();

		expect(footer.innerBlocks[0]).toMatchObject({
			attributes: { slug: 'credits' },
			innerBlocks: [paragraph('©')],
		});
	});

	it('inlines nested template parts in translated variants', async () => {
		wordpressReturns(
			[part('footer')],
			[
				{
					slug: 'footer',
					blocksJSON: JSON.stringify([part('credits')]),
				},
				{
					slug: 'footer___de',
					language: { baseSlug: 'footer', code: 'de' },
					blocksJSON: JSON.stringify([group(part('credits'))]),
				},
				{
					slug: 'credits',
					blocksJSON: JSON.stringify([paragraph('©')]),
				},
			]
		);

		const [footer] = await pageTemplateBlocks();

		expect(footer.translations?.de?.[0]?.innerBlocks[0]).toMatchObject({
			attributes: { slug: 'credits' },
			innerBlocks: [paragraph('©')],
		});
	});

	it('keeps the area and translations of a nested template part', async () => {
		wordpressReturns(
			[part('footer')],
			[
				{
					slug: 'footer',
					blocksJSON: JSON.stringify([part('credits')]),
				},
				{
					slug: 'credits',
					area: 'uncategorized',
					blocksJSON: JSON.stringify([paragraph('©')]),
				},
				{
					slug: 'credits___de',
					language: { baseSlug: 'credits', code: 'de' },
					blocksJSON: JSON.stringify([paragraph('© DE')]),
				},
			]
		);

		const [footer] = await pageTemplateBlocks();

		expect(footer.innerBlocks[0]).toMatchObject({
			attributes: { slug: 'credits', area: 'uncategorized' },
			innerBlocks: [paragraph('©')],
			translations: { de: [paragraph('© DE')] },
		});
	});

	it('inlines the same template part used twice', async () => {
		wordpressReturns(
			[part('divider'), group(part('divider'))],
			[
				{
					slug: 'divider',
					blocksJSON: JSON.stringify([paragraph('—')]),
				},
			]
		);

		const [first, wrapper] = await pageTemplateBlocks();

		expect(first.innerBlocks).toEqual([paragraph('—')]);
		expect(wrapper.innerBlocks[0].innerBlocks).toEqual([paragraph('—')]);
	});

	it('stops at a template part that references itself', async () => {
		wordpressReturns(
			[part('loop')],
			[
				{
					slug: 'loop',
					blocksJSON: JSON.stringify([group(part('loop'))]),
				},
			]
		);

		const [loop] = await pageTemplateBlocks();

		expect(loop.innerBlocks[0].innerBlocks[0]).toEqual(part('loop'));
	});

	it('stops at template parts that reference each other', async () => {
		wordpressReturns(
			[part('a')],
			[
				{ slug: 'a', blocksJSON: JSON.stringify([part('b')]) },
				{ slug: 'b', blocksJSON: JSON.stringify([part('a')]) },
			]
		);

		const [a] = await pageTemplateBlocks();

		expect(a.innerBlocks[0]).toMatchObject({
			attributes: { slug: 'b' },
			innerBlocks: [part('a')],
		});
	});
});
