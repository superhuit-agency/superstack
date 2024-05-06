import * as cardNewsData from '@/components/molecules/cards/CardNews/data';

import { FetchApiFuncType } from '@/lib/fetch-api';
import { gql } from '@/utils';

import block from './block.json';
import { SectionNewsPost } from '.';

// Export block slug for identification
export const slug = block.slug;

const isValidData = (
	data: unknown
): data is {
	posts: {
		nodes: Array<unknown>;
	};
} => !!data && typeof data === 'object' && 'posts' in data;

/**
 * Dynamic data formatter/parser.
 *
 * @param {object}     data      Data from GraphQL query response
 * @param {boolean} isEditor  Wheter the formatter function is being called within the WP block editor.
 * @returns {SectionNewsPost}             The transformed/formatted/parsed data
 */
export const formatter = (data: unknown, isEditor = false): SectionNewsPost => {
	if (!isValidData(data)) throw new Error('Invalid data');

	const { posts } = data;

	return {
		posts: posts.nodes.map((n) => cardNewsData.formatter(n, isEditor)),
	};
};
/**
 * GraphQL data fetching.
 * Should return the final props needed for the block
 *
 * @param {Function} fetcher    The context based function to request the GraphQl endpoint.
 *                              Arguments: - {string} query, [{any} variables].
 * @param {any}      attrs      The attributes of the block
 * @param {boolean}  isEditor   Wheter the context is within the WP block editor.
 */
export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: any = null,
	isEditor: boolean = false
): Promise<SectionNewsPost> => {
	const query = gql`
		query sectionNewsQuery(
			$size: Int = 6
			$offset: Int = 0
			$categoryIn: [ID] = []
			$tagIn: [ID] = []
			$postIn: [ID] = []
			$stati: [PostStatusEnum] = [PUBLISH]
		) {
			posts(
				where: {
					offsetPagination: { size: $size, offset: $offset }
					in: $postIn
					categoryIn: $categoryIn
					tagIn: $tagIn
					stati: $stati
				}
			) {
				nodes {
					...cardNewsFragment
				}
			}
		}
		${cardNewsData.fragment}
	`;

	// construct the query variables (maybe based on the `attributes` argument)
	const options = { variables: attrs?.queryVars } ?? {};

	const data = await fetcher(query, options);

	return formatter(data, isEditor);
};
