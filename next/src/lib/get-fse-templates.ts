import { cacheLife, cacheTag } from 'next/cache';

import fetchAPI from '@/lib/fetch-api';
import formatBlocksJSON from '@/lib/format-blocks-json';
import { cacheTags } from '@/lib/cache-tags';
import { gql } from '@/utils';

type GraphQlNode = {
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

	// Missing when the request failed: don't let a failure be cached as "no template"
	if (allTemplates === undefined || allTemplateParts === undefined) {
		throw new Error('Could not read the FSE templates from WordPress');
	}

	const templateParts: GraphQlNode[] = (allTemplateParts ?? []).filter(
		Boolean
	);

	return Promise.all(
		(allTemplates ?? [])
			.filter((template: GraphQlNode | null) => !!template)
			.map(async (template: GraphQlNode) => {
				const blocks = await formatBlocksJSON(
					template.blocksJSON ?? '',
					{ skipGetData: true }
				);

				return {
					slug: template.slug,
					blocks: await Promise.all(
						blocks
							.filter((b: BlockPropsType | null) => !!b)
							.map((block: BlockPropsType) =>
								block.name === 'core/template-part'
									? inlineTemplatePart(block, templateParts)
									: block
							)
					),
				};
			})
	);
}

/**
 * Replaces a `core/template-part` block's `innerBlocks` with the blocks of the
 * matching template part, and attaches its translated variants as `translations`.
 */
async function inlineTemplatePart(
	block: BlockPropsType,
	templateParts: GraphQlNode[]
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
		formatBlocksJSON(basePart?.blocksJSON ?? '', { skipGetData: true }),
		Promise.all(
			translationParts.map(
				async (
					part
				): Promise<[string, Array<BlockPropsType | null>]> => [
					part.language!.code,
					await formatBlocksJSON(part.blocksJSON ?? '', {
						skipGetData: true,
					}),
				]
			)
		),
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
