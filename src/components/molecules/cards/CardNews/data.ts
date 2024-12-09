import { gql } from '@/utils';
import block from './block.json';

import * as imageData from '@/components/molecules/Image/data';

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
				...imageFragment
			}
		}

		categories(first: 1) {
			nodes {
				title: name
				href: uri
			}
		}
	}
	${imageData.fragment}
`;

const isValidData = (data: GraphQLCardNewsFields) =>
	!!data && typeof data === 'object' && 'title' in data && 'status' in data;

/**
 * Dynamic data formatter/parser.
 *
 * @param {GraphQLCardNewsFields}     data  Data from GraphQL query response
 * @param {boolean} isEditor  Whether the formatter function is being called within the WP block editor.
 * @returns {CardNewsData}    The transformed/formatted/parsed data
 */
export const formatter = (
	props: GraphQLCardNewsFields,
	isEditor = false
): CardNewsProps => {
	if (!isValidData(props)) throw new Error('Invalid card news data');

	const { title, image, categories, status, ...rest } = props;

	return {
		...rest,
		title,
		image: imageData.formatter(image),
		category:
			categories?.nodes && categories.nodes?.length > 0
				? categories.nodes[0]
				: undefined,
	};
};
