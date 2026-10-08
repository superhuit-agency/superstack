// import * as blocksData from '@/components/data';
import { cache } from 'react';

import {
	baseUriContext,
	throwIfBaseUriNotDeclared,
} from '@/hooks/use-base-uri';
import fetchAPI from '@/lib/fetch-api';
import getCachedBlockData, {
	type BlockData,
	blockUsesBaseUri,
	getBlockDataModule,
} from '@/lib/get-cached-block-data';
import { throwIfWordPressReadFailed } from '@/lib/wordpress-read-error';

type BlockPropsOptions = {
	skipGetData?: boolean;
	lang?: string | null;
	preview?: boolean;
	/** The page being viewed, for blocks declaring `usesArchiveContext`. */
	context?: BlockDataContext;
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
 * The block data reads in flight in the current render, by cache key.
 *
 * `'use cache'` doesn't share a miss in progress: a block used twice with the
 * same attributes (the site title in the header and in the footer) would read
 * WordPress twice on a cold cache. Kept to one render, so both calls belong to
 * the cache scope the entry's tags propagate to.
 */
const blockDataReads = cache(
	() => new Map<string, ReturnType<typeof getCachedBlockData>>()
);

const getBlockDataOnce = (
	...args: Parameters<typeof getCachedBlockData>
): ReturnType<typeof getCachedBlockData> => {
	const reads = blockDataReads();
	const key = JSON.stringify(args);

	let read = reads.get(key);
	if (!read) {
		read = getCachedBlockData(...args);
		reads.set(key, read);
	}

	return read;
};

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
		getAttributes(name, attributes, innerBlocks, options),
		getInnerBlocks(innerBlocks, options),
	]);
	throwIfBaseUriNotDeclared(results);
	// Nothing is cached in preview: the block falls back to its own attributes
	if (!options?.preview) throwIfWordPressReadFailed(results);

	const [attrsResult, blksResult] = results;

	if (attrsResult.status === 'fulfilled') {
		const { attrs, innerBlocks: dataInnerBlocks } = attrsResult.value;
		props.attributes = attrs ?? {};

		// If getData returned innerBlocks, use those (fresh) instead of the
		// static ones — but still run them back through this same enrichment
		// pipeline, so any dynamic block nested inside (e.g. a `core/navigation`
		// nested inside a submenu, or a pagination block inside a `core/query`)
		// gets its own getData resolved too.
		if (dataInnerBlocks !== undefined) {
			props.innerBlocks = (await getInnerBlocks(
				dataInnerBlocks,
				options
			)) as BlockPropsType['innerBlocks'];
		} else if (blksResult.status === 'fulfilled') {
			props.innerBlocks =
				(blksResult.value as BlockPropsType['innerBlocks']) ?? [];
		}
	} else {
		// getData failed: render the block with its own attributes
		props.attributes = attributes as Record<string, unknown>;

		if (blksResult.status === 'fulfilled') {
			props.innerBlocks =
				(blksResult.value as BlockPropsType['innerBlocks']) ?? [];
		}
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
	innerBlocks: Array<BlockPropsType>,
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
	const { usesArchiveContext } = blockModule;
	const context = (
		typeof usesArchiveContext === 'function'
			? usesArchiveContext(attributes)
			: usesArchiveContext
	)
		? { ...options?.context, innerBlocks }
		: undefined;

	let data: Record<string, unknown>;
	if (options?.preview) {
		const liveData: BlockData = {
			...(await blockModule.getData(fetchAPI, attributes, lang, context)),
		};
		delete liveData.cacheTags;
		data = liveData;
	} else {
		data = await getBlockDataOnce(
			name,
			attributes,
			lang,
			blockUsesBaseUri(blockModule, attributes)
				? ((baseUriContext() as string | undefined) ?? null)
				: null,
			context
		);
	}

	const { innerBlocks: dataInnerBlocks, ...restData } = data as {
		innerBlocks?: BlockPropsType[];
	} & Record<string, unknown>;

	return {
		attrs: { ...attrs, ...restData },
		...(dataInnerBlocks !== undefined
			? { innerBlocks: dataInnerBlocks }
			: {}),
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
	throwIfWordPressReadFailed(rs);

	return rs.map((r) => (r.status === 'fulfilled' ? r.value : null));
};
