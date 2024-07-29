import { gql } from '@/utils';

const isValidData = (data: GraphQLImageFields): boolean => {
	return !!data && typeof data === 'object' && 'sourceUrl' in data;
};

/**
 * Dynamic data formatter/parser.
 *
 * @param {any} data         Data from GraphQL query response
 * @param {boolean} isEditor Wheter the formatter function is executed within the WP block editor.
 * @param {any} extraProps   Extra props to pass down to the image component
 * @returns {any}            The transformed/formatted/parsed data
 */
export const formatter = (
	data: GraphQLImageFields | GraphQLMediaFields,
	isEditor = false,
	extraProps: any = {}
): undefined | ImageProps => {
	const img = 'node' in data ? data?.node : data;

	if (!img || !isValidData(img)) throw new Error('Invalid image data');

	if (isEditor || !img?.mediaDetails?.width || !img?.mediaDetails?.height) {
		extraProps.unoptimized = true;
	}

	return {
		src: img.sourceUrl,
		alt: img?.altText ?? '',
		caption: img?.caption ?? null,
		width: img?.mediaDetails?.width ?? undefined,
		height: img?.mediaDetails?.height ?? undefined,
		...extraProps,
	};
};

/**
 * GraphQL fragment that can be used by another block's query.
 */
export const fragment = gql`
	fragment imageFragment on MediaItem {
		altText
		caption
		mediaDetails {
			height
			width
		}
		sourceUrl
	}
`;
