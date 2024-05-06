import { gql } from '@/utils';
import block from './block.json';
import { CardNewsProps } from '.';

export const slug = block.slug;

/**
 * GraphQL fragment that can be used by another block's query.
 */
export const fragment = gql`
	fragment cardNewsFragment on Post {
		id: databaseId
		title(format: RENDERED)
		excerpt(format: RENDERED)
		date
		uri
		status

		image: featuredImage {
			node {
				src: sourceUrl
				caption
				altText
				mediaDetails {
					height
					width
				}
			}
		}

		categories(first: 1) {
			nodes {
				title: name
				href: uri
			}
		}
	}
`;

const isValidData = (
	data: unknown
): data is {
	title: string;
	image: {
		node: {
			src: string;
			altText: string;
			mediaDetails: { width: number; height: number };
		};
	};
	categories: { nodes: { title: string; href: string }[] };
	status: string;
	date: string;
	uri: string;
} => !!data && typeof data === 'object' && 'title' in data && 'status' in data;

/**
 * Dynamic data formatter/parser.
 *
 * @param {unknown}     data  Data from GraphQL query response
 * @param {boolean} isEditor  Whether the formatter function is being called within the WP block editor.
 * @returns {CardNewsData}    The transformed/formatted/parsed data
 */
export const formatter = (props: unknown, isEditor = false): CardNewsProps => {
	if (!isValidData(props)) throw new Error('Invalid card news data');

	const { title, image, categories, status, ...rest } = props;

	return {
		...rest,
		title,
		image: image?.node?.src
			? {
					src: image.node.src,
					alt: image.node.altText || '',
					width: image.node.mediaDetails.width,
					height: image.node.mediaDetails.height,
				}
			: undefined,
		category:
			categories?.nodes && categories.nodes?.length > 0
				? categories.nodes[0]
				: undefined,
	};
};
