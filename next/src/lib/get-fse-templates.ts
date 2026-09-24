import { cacheLife, cacheTag } from 'next/cache';

import fetchAPI from '@/lib/fetch-api';
import formatBlocksJSON from '@/lib/format-blocks-json';
import { cacheTags } from '@/lib/cache-tags';
import { gql } from '@/utils';
import { resolvePromises } from '@/utils/resolve-promises';

type FseGraphQlNode = {
	slug: string;
	area?: string;
	blocksJSON?: string;
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

	const templateParts: FseGraphQlNode[] = allTemplateParts.filter(Boolean);

	// Settled one by one, so a template that fails to parse is dropped
	// instead of failing every page
	const templates = await resolvePromises(
		allTemplates.filter(Boolean).map(async (template: FseGraphQlNode) => ({
			slug: template.slug,
			blocks: await resolvePromises(
				(await formatStructure(template))
					.filter((block): block is BlockPropsType => !!block)
					.map((block: BlockPropsType) =>
						block.name === 'core/template-part'
							? inlineTemplatePart(block, templateParts)
							: Promise.resolve(block)
					)
			),
		}))
	);

	return templates.filter(Boolean) as FseTemplateEntry[];
}

/**
 * Replaces a `core/template-part` block's `innerBlocks` with the blocks of the
 * matching template part, and attaches its translated variants as `translations`.
 */
async function inlineTemplatePart(
	block: BlockPropsType,
	templateParts: FseGraphQlNode[]
): Promise<BlockPropsType> {
	const requestedSlug = block.attributes?.slug;

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
		formatStructure(basePart),
		resolvePromises(
			translationParts.map(
				async (
					part
				): Promise<[string, Array<BlockPropsType | null>]> => [
					part.language!.code,
					await formatStructure(part),
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

/** Parses a template's or part's blocks, without fetching any block data. */
function formatStructure(node?: FseGraphQlNode) {
	return formatBlocksJSON(node?.blocksJSON ?? '', { skipGetData: true });
}
