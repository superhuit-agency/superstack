import * as blocksData from '@/components/data';
import { fetchAPI } from '@/lib';

const blocksDataList: { [key: string]: any } = {};
for (const key in blocksData) {
	const blkData = blocksData[key as keyof typeof blocksData] as any;

	if (blkData?.slug) {
		blocksDataList[blkData.slug] = blkData;
	} else {
		if (process.env.NODE_ENV === 'development') {
			console.warn(
				`Missing exported slug for block's ${key} data.ts file.`
			);
		}
	}
}

/**
 * Get a lightweight version of a block's data.
 * Used to reduce the amount of data served to the frontend.
 * @param block A block object coming from Wp GraphQl's blocksJSON
 * @returns the same block, with only necessary data
 */
export default function getBlockFinalComponentProps(
	rawProps: RawBlockPropsType
): Promise<BlockPropsType> {
	return new Promise(async (res, rej) => {
		const props: BlockPropsType = {
			name: rawProps.name,
			attributes: {},
			innerBlocks: [],
		};
		Promise.allSettled([
			getAttributes(rawProps.name, rawProps.attributes),
			getInnerBlocks(rawProps.innerBlocks),
		]).then(([attrs, blks]) => {
			if (attrs.status === 'fulfilled')
				props.attributes =
					(attrs?.value as Record<string, unknown>) ?? {};

			if (blks.status === 'fulfilled') {
				props.innerBlocks =
					(blks?.value as BlockPropsType['innerBlocks']) ?? [];
			}

			// content support for core blocks with originalContent
			if (
				props.attributes &&
				!props.attributes.content &&
				rawProps.originalContent
			) {
				props.attributes.content = rawProps.originalContent;
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
const getAttributes = (name: string, attributes: object) =>
	new Promise((res, rej) => {
		if (!blocksDataList[name]) res(attributes);
		else {
			blocksDataList[name]
				.getData(fetchAPI, attributes)
				.then((data = {}) => {
					res({ ...attributes, ...data });
				});
		}
	});

const getInnerBlocks = (blocks: Array<RawBlockPropsType>) =>
	new Promise((res, rej) => {
		if (!(blocks?.length > 0)) rej([]);
		else {
			Promise.allSettled(blocks.map(getBlockFinalComponentProps)).then(
				(rs) =>
					res(
						rs.map((r) =>
							r.status === 'fulfilled' ? r.value : null
						)
					)
			);
		}
	});
