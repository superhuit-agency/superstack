// import * as blocksData from '@/components/data';
import {
	baseUriContext,
	throwIfBaseUriNotDeclared,
} from '@/hooks/use-base-uri';
import fetchAPI from '@/lib/fetch-api';
import getCachedBlockData, {
	type BlockData,
	getBlockDataModule,
} from '@/lib/get-cached-block-data';

type BlockPropsOptions = {
	skipGetData?: boolean;
	lang?: string | null;
	preview?: boolean;
};

// const blocksDataList: { [key: string]: any } = {};
// for (const key in blocksData) {
//   const blkData = blocksData[key as keyof typeof blocksData] as any;

//   if (blkData?.slug) {
//     blocksDataList[blkData.slug] = blkData;
//   } else {
//     if (process.env.NODE_ENV === 'development') {
//       console.warn(`Missing exported slug for block's ${key} data.ts file.`);
//     }
//   }
// }

/**
 * Get a lightweight version of a block's data.
 * Used to reduce the amount of data served to the frontend.
 *
 * A block's `data.ts` may export `getData(fetcher, attrs)` which returns
 * `{ ...extraAttrs, innerBlocks? }`. When `innerBlocks` is present in that
 * return value, it overrides the static `innerBlocks` from the FSE templates
 * — used by blocks whose children change independently of the template
 * (e.g. `core/navigation` menu items). See docs/fse-templating.md.
 *
 * Outside preview, `getData` runs in its own cache entry, tagged with the
 * `cacheTags` it returns next to its data (see `getCachedBlockData`).
 *
 * @param block A block object coming from Wp GraphQl's blocksJSON
 * @returns the same block, with only necessary data
 */
export default async function getBlockFinalComponentProps(
	{
		name,
		attributes,
		innerBlocks,
	}: {
		name: string;
		attributes: object;
		innerBlocks: Array<BlockPropsType>;
	},
	options?: BlockPropsOptions
): Promise<BlockPropsType> {
	const props: BlockPropsType = {
		name,
		attributes: {},
		innerBlocks: [],
	};

	const results = await Promise.allSettled([
		getAttributes(name, attributes, options),
		getInnerBlocks(innerBlocks, options),
	]);
	throwIfBaseUriNotDeclared(results);

	const [attrsResult, blksResult] = results;

	if (attrsResult.status === 'fulfilled') {
		const { attrs, innerBlocks: dataInnerBlocks } = attrsResult.value;
		props.attributes = attrs ?? {};

		// If getData returned innerBlocks, use those (fresh) and skip the static ones.
		// (this is a fix made for core/navigation for example, which has links as innerBlocks, but we want them to be always up to date, even if it's part of the FSE template)
		if (dataInnerBlocks !== undefined) {
			props.innerBlocks = dataInnerBlocks;
		} else if (blksResult.status === 'fulfilled') {
			props.innerBlocks =
				(blksResult.value as BlockPropsType['innerBlocks']) ?? [];
		}
	} else if (blksResult.status === 'fulfilled') {
		props.innerBlocks =
			(blksResult.value as BlockPropsType['innerBlocks']) ?? [];
	}

	return props;
}

/**
 * Enrich and/or format block's attributes if `data.query` / `data.formatter` is set for current block
 *
 * @param   {string} name       Name of the block
 * @param   {any}    attributes Initial block's attributes. Will be returned as it or enriched and/or formatted.
 * @returns {any}
 */
const getAttributes = async (
	name: string,
	attributes: object,
	options?: BlockPropsOptions
): Promise<{
	attrs: Record<string, unknown>;
	innerBlocks?: BlockPropsType[];
}> => {
	const attrs = attributes as Record<string, unknown>;

	if (options?.skipGetData) return { attrs };

	const blockModule = await getBlockDataModule(name);

	if (!blockModule?.getData) return { attrs };

	const lang = options?.lang ?? null;

	let data: Record<string, unknown>;
	if (options?.preview) {
		const liveData: BlockData = {
			...(await blockModule.getData(fetchAPI, attributes, lang)),
		};
		delete liveData.cacheTags;
		data = liveData;
	} else {
		data = await getCachedBlockData(
			name,
			attributes,
			lang,
			blockModule.usesBaseUri
				? ((baseUriContext() as string | undefined) ?? null)
				: null
		);
	}

	const { innerBlocks, ...restData } = data as {
		innerBlocks?: BlockPropsType[];
	} & Record<string, unknown>;

	return {
		attrs: { ...attrs, ...restData },
		...(innerBlocks !== undefined ? { innerBlocks } : {}),
	};
};

const getInnerBlocks = async (
	blocks: Array<BlockPropsType>,
	options?: BlockPropsOptions
) => {
	if (!(blocks?.length > 0)) return [];

	const rs = await Promise.allSettled(
		blocks.map((block) =>
			getBlockFinalComponentProps({ ...block }, options)
		)
	);
	throwIfBaseUriNotDeclared(rs);

	return rs.map((r) => (r.status === 'fulfilled' ? r.value : null));
};
