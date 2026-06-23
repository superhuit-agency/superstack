// import * as blocksData from '@/components/data';
import { blocksDataList } from '@/components/global/blockRegistry';
import fetchAPI from '@/lib/fetch-api';

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
 * return value, it overrides the static `innerBlocks` from the JSON snapshot
 * — used by blocks whose children change independently of the template
 * (e.g. `core/navigation` menu items). See docs/fse-templating.md.
 *
 * @param block A block object coming from Wp GraphQl's blocksJSON
 * @returns the same block, with only necessary data
 */
export default function getBlockFinalComponentProps(
	{
		name,
		attributes,
		innerBlocks,
	}: {
		name: string;
		attributes: object;
		innerBlocks: Array<BlockPropsType>;
	},
	options?: { skipGetData?: boolean }
): Promise<BlockPropsType> {
	return new Promise(async (res) => {
		const props: BlockPropsType = {
			name,
			attributes: {},
			innerBlocks: [],
		};

		Promise.allSettled([
			getAttributes(name, attributes, options?.skipGetData),
			getInnerBlocks(innerBlocks, options?.skipGetData),
		]).then(([attrsResult, blksResult]) => {
			if (attrsResult.status === 'fulfilled') {
				const { attrs, innerBlocks: dataInnerBlocks } =
					attrsResult.value as {
						attrs: Record<string, unknown>;
						innerBlocks?: BlockPropsType[];
					};
				props.attributes = attrs ?? {};

				// If getData returned innerBlocks, use those (fresh) and skip the static ones.
				// (this is a fix made for core/navigation for example, which has links as innerBlocks, but we want them to be always up to date, even if it's part of the FSE template)
				if (dataInnerBlocks !== undefined) {
					props.innerBlocks = dataInnerBlocks;
				} else if (blksResult.status === 'fulfilled') {
					props.innerBlocks =
						(blksResult.value as BlockPropsType['innerBlocks']) ??
						[];
				}
			} else if (blksResult.status === 'fulfilled') {
				props.innerBlocks =
					(blksResult.value as BlockPropsType['innerBlocks']) ?? [];
			}

			res(props);
		});
	});
}

/**
 * Enrich and/or format block's attributes if `data.query` / `data.formatter` is set for current block
 *
 * @param   {string} name       Name of the block
 * @param   {any}    attributes Initial block's attributes. Will be returned as it or enriched and/or formatted.
 * @returns {any}
 */
const getAttributes = (name: string, attributes: object, skipGetData = false) =>
	new Promise(async (res) => {
		if (skipGetData || !blocksDataList[name as keyof typeof blocksDataList])
			res({ attrs: attributes });
		else {
			const blockModule =
				await blocksDataList[name as keyof typeof blocksDataList]?.();
			const getData = (
				blockModule as {
					getData?: (
						fetcher: FetchApiFuncType,
						attrs: object
					) => Promise<object>;
				}
			).getData;

			if (!getData) {
				res({ attrs: attributes });
				return;
			}

			getData(fetchAPI, attributes).then((data = {}) => {
				const { innerBlocks, ...restData } = data as {
					innerBlocks?: BlockPropsType[];
				} & Record<string, unknown>;
				res({
					attrs: { ...attributes, ...restData },
					...(innerBlocks !== undefined ? { innerBlocks } : {}),
				});
			});
		}
	});

const getInnerBlocks = (blocks: Array<BlockPropsType>, skipGetData = false) =>
	new Promise((res, rej) => {
		if (!(blocks?.length > 0)) rej([]);
		else {
			Promise.allSettled(
				blocks.map((block) =>
					getBlockFinalComponentProps({ ...block }, { skipGetData })
				)
			).then((rs) =>
				res(rs.map((r) => (r.status === 'fulfilled' ? r.value : null)))
			);
		}
	});
