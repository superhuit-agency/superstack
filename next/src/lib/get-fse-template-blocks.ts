import getBlockFinalComponentProps from '@/lib/get-block-final-component-props';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — file is gitignored and generated at dev/build time via predev/prebuild
import fseTemplatesData from '@/lib/fse/fse-templates-and-parts.json';

/**
 * Gets the blocks of the template from the FSE templates and parts data
 * @param templateSlug - The slug of the template
 * @returns
 */
export const getTemplateBlocks = (templateSlug: string): BlockPropsType[] => {
	if (!templateSlug) return [];

	const fseTemplate: FseTemplateEntry | null =
		(fseTemplatesData as FseTemplatesData)?.templates?.find(
			(tpl) => tpl?.slug === templateSlug
		) ?? null;

	if (!fseTemplate?.blocks?.length) return [];

	return fseTemplate.blocks.filter(Boolean) as BlockPropsType[];
};

/**
 * Runs getData enrichment on template blocks at request time so dynamic data
 * (navigation, site logo, etc.) is always fresh and not baked in at build time.
 */
export const enrichTemplateBlocks = (
	blocks: BlockPropsType[]
): Promise<BlockPropsType[]> =>
	blocks.length === 0
		? Promise.resolve([])
		: Promise.allSettled(
				blocks.map((block) => getBlockFinalComponentProps(block))
			).then(
				(results) =>
					results
						.map((r) => (r.status === 'fulfilled' ? r.value : null))
						.filter(Boolean) as BlockPropsType[]
			);
