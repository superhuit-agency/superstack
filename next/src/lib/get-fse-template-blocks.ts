import { throwIfBaseUriNotDeclared } from '@/hooks/use-base-uri';
import getBlockFinalComponentProps from '@/lib/get-block-final-component-props';
import getFseTemplates from '@/lib/get-fse-templates';
import { throwIfWordPressReadFailed } from '@/lib/wordpress-read-error';

/**
 * Recursively swaps a `core/template-part` block's `innerBlocks` for its
 * `translations[lang]` variant, when the template read found one.
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
 * Gets the blocks of the template from the cached FSE templates read,
 * swapping in the `lang`-specific variant of any translated template part
 * (e.g. footer, header) before request-time enrichment runs.
 * @param templateSlug - The slug of the template
 * @param lang - The requested language code, if any
 * @returns
 */
export const getTemplateBlocks = async (
	templateSlug: string,
	lang: string | null = null
): Promise<BlockPropsType[]> => {
	if (!templateSlug) return [];

	const fseTemplate: FseTemplateEntry | null =
		(await getFseTemplates()).find((tpl) => tpl?.slug === templateSlug) ??
		null;

	if (!fseTemplate?.blocks?.length) return [];

	return applyTemplatePartTranslations(
		fseTemplate.blocks.filter(Boolean) as BlockPropsType[],
		lang
	);
};

/**
 * Runs getData enrichment on template blocks at request time so dynamic data
 * (navigation, site logo, etc.) is fetched per page, not baked into the cached
 * FSE templates.
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
			).then((results) => {
				throwIfBaseUriNotDeclared(results);
				throwIfWordPressReadFailed(results);

				return results
					.map((r) => (r.status === 'fulfilled' ? r.value : null))
					.filter(Boolean) as BlockPropsType[];
			});
