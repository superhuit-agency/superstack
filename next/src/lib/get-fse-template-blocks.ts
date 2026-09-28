import getBlockFinalComponentProps from '@/lib/get-block-final-component-props';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — file is gitignored and generated at dev/build time via predev/prebuild
import fseTemplatesData from '@/lib/fse/fse-templates-and-parts.json';

/**
 * Gets the blocks of the template from the FSE templates and parts data,
 * swapping in the `lang`-specific variant of any translated template part
 * (e.g. footer, header) before request-time enrichment runs.
 * @param templateSlug - The slug of the template
 * @param lang - The requested language code, if any
 * @returns
 */
export const getTemplateBlocks = (
	templateSlug: string,
	lang: string | null = null
): BlockPropsType[] => {
	if (!templateSlug) return [];

	const fseTemplate: FseTemplateEntry | null =
		(fseTemplatesData as FseTemplatesData)?.templates?.find(
			(tpl) => tpl?.slug === templateSlug
		) ?? null;

	if (!fseTemplate?.blocks?.length) return [];

	return applyTemplatePartTranslations(
		fseTemplate.blocks.filter(Boolean) as BlockPropsType[],
		lang
	);
};

/**
 * Recursively swaps a `core/template-part` block's `innerBlocks` for its
 * `translations[lang]` variant, when one was baked into the JSON snapshot.
 * Falls back to the default (base-language) `innerBlocks` otherwise.
 */
const applyTemplatePartTranslations = (
	blocks: BlockPropsType[],
	lang: string | null
): BlockPropsType[] =>
	blocks.map((block) => {
		const translatedInnerBlocks =
			lang && block.name === 'core/template-part'
				? block.translations?.[lang]
				: undefined;

		return {
			...block,
			innerBlocks: applyTemplatePartTranslations(
				(translatedInnerBlocks ?? block.innerBlocks ?? []).filter(
					Boolean
				) as BlockPropsType[],
				lang
			),
		};
	});

/**
 * Runs getData enrichment on template blocks at request time so dynamic data
 * (navigation, site logo, etc.) is always fresh and not baked in at build time.
 */
export const enrichTemplateBlocks = (
	blocks: BlockPropsType[],
	options?: Parameters<typeof getBlockFinalComponentProps>[1]
): Promise<BlockPropsType[]> =>
	blocks.length === 0
		? Promise.resolve([])
		: Promise.allSettled(
				blocks.map((block) =>
					getBlockFinalComponentProps(block, options)
				)
			).then(
				(results) =>
					results
						.map((r) => (r.status === 'fulfilled' ? r.value : null))
						.filter(Boolean) as BlockPropsType[]
			);
