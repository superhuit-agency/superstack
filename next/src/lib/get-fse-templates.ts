import { cacheLife, cacheTag } from 'next/cache';

import fetchAPI from '@/lib/fetch-api';
import formatBlocksJSON from '@/lib/format-blocks-json';
import { cacheTags } from '@/lib/cache-tags';
import { gql } from '@/utils';
import { resolvePromises } from '@/utils/resolve-promises';

type FseTemplateNode = {
	slug: string;
	blocksJSON?: string;
};

type FseTemplatePartNode = FseTemplateNode & {
	area?: string;
	language?: { baseSlug: string; code: string };
};

/**
 * Every FSE template, with its template parts inlined, cached until the
 * `templates` tag is revalidated.
 *
 * Holds the block structure only (`skipGetData`): dynamic data (navigation,
 * site logo…) is fetched per page when the template blocks are enriched.
 */
export default async function getFseTemplates(): Promise<FseTemplateEntry[]> {
	'use cache';
	cacheLife('max');
	cacheTag(cacheTags.templates(), cacheTags.nodes());

	const { allTemplates, allTemplateParts } = await fetchAPI(gql`
		query fseTemplatesQuery {
			allTemplates {
				slug
				blocksJSON
			}
			allTemplateParts {
				area
				slug
				blocksJSON
				language {
					baseSlug
					code
				}
			}
		}
	`);

	// Both fields always resolve to a list: anything else is a failed request,
	// which must not be cached as "no template"
	if (!Array.isArray(allTemplates) || !Array.isArray(allTemplateParts)) {
		throw new Error('Could not read the FSE templates from WordPress');
	}

	const templateParts: FseTemplatePartNode[] =
		allTemplateParts.filter(Boolean);

	// Settled one by one, so a template that fails to parse is dropped
	// instead of failing every page
	const templates = await resolvePromises(
		allTemplates.filter(Boolean).map(async (template: FseTemplateNode) => ({
			slug: template.slug,
			blocks: await parseAndInlineBlocks(template, templateParts),
		}))
	);

	return templates.filter(Boolean) as FseTemplateEntry[];
}

/**
 * Inlines every `core/template-part` block at any depth — a template may wrap
 * one in a group, and a part may include another part. `seen` holds the slugs
 * already being inlined, so a part that (indirectly) references itself
 * doesn't loop.
 */
async function inlineTemplateParts(
	blocks: Array<BlockPropsType | null>,
	templateParts: FseTemplatePartNode[],
	seen: string[] = []
): Promise<BlockPropsType[]> {
	const inlined = await resolvePromises(
		blocks
			.filter((block): block is BlockPropsType => !!block)
			.map(async (block: BlockPropsType) =>
				block.name === 'core/template-part'
					? inlineTemplatePart(block, templateParts, seen)
					: {
							...block,
							innerBlocks: await inlineTemplateParts(
								block.innerBlocks ?? [],
								templateParts,
								seen
							),
						}
			)
	);

	return inlined.filter(Boolean) as BlockPropsType[];
}

/**
 * Replaces a `core/template-part` block's `innerBlocks` with the blocks of the
 * matching template part, and attaches its translated variants as `translations`.
 */
async function inlineTemplatePart(
	block: BlockPropsType,
	templateParts: FseTemplatePartNode[],
	seen: string[]
): Promise<BlockPropsType> {
	const requestedSlug = block.attributes?.slug;

	if (typeof requestedSlug !== 'string' || seen.includes(requestedSlug)) {
		return block;
	}

	const nestedSeen = [...seen, requestedSlug];

	// Group every part sharing this base slug (e.g. "footer" and
	// "footer___de") — Polylang Pro's FSE naming convention,
	// parsed server-side into `language.baseSlug` / `language.code`.
	const matchingParts = templateParts.filter(
		(part) => (part.language?.baseSlug ?? part.slug) === requestedSlug
	);
	const basePart =
		matchingParts.find((part) => !part.language?.code) ?? matchingParts[0];
	const translationParts = matchingParts.filter(
		(part) => part.language?.code && part !== basePart
	);

	const [innerBlocks, translationEntries] = await Promise.all([
		parseAndInlineBlocks(basePart, templateParts, nestedSeen),
		resolvePromises(
			translationParts.map(
				async (part): Promise<[string, BlockPropsType[]]> => [
					part.language!.code,
					await parseAndInlineBlocks(part, templateParts, nestedSeen),
				]
			)
		).then((entries) => entries.filter((entry) => entry !== null)),
	]);

	return {
		...block,
		attributes: {
			...(block.attributes ?? {}),
			...(basePart?.area ? { area: basePart.area } : {}),
		},
		innerBlocks,
		...(translationEntries.length
			? { translations: Object.fromEntries(translationEntries) }
			: {}),
	};
}

/**
 * Parses a template's or part's blocks, without fetching any block data, and
 * inlines the template parts they include.
 */
async function parseAndInlineBlocks(
	node: FseTemplateNode | undefined,
	templateParts: FseTemplatePartNode[],
	seen: string[] = []
): Promise<BlockPropsType[]> {
	const blocks = await formatBlocksJSON(node?.blocksJSON ?? '', {
		skipGetData: true,
	});

	return inlineTemplateParts(blocks, templateParts, seen);
}
