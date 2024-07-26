import { cardNewsData } from '@/components/data';

import { gql } from '@/utils';

import block from './block.json';

// Export block slug for identification
export const slug = block.slug;

const isValidData = (data: GraphqlSectionNewsFields) =>
	!!data && typeof data === 'object' && 'posts' in data;

/**
 * Dynamic data formatter/parser.
 *
 * @param {GraphqlSectionNewsFields}     data      Data from GraphQL query response
 * @param {boolean} isEditor  Wheter the formatter function is being called within the WP block editor.
 * @returns {SectionNewsData}             The transformed/formatted/parsed data
 */
export const formatter = (
	data: GraphqlSectionNewsFields,
	isEditor = false
): SectionNewsData => {
	if (!isValidData(data)) throw new Error('Invalid section news data');

	const { posts } = data;

	return {
		posts: posts.nodes.map((n) => cardNewsData.formatter(n, isEditor)),
	};
};
/**
 * GraphQL data fetching.
 * Should return the final props needed for the block
 *
 * @param {Function} fetcher            The context based function to request the GraphQl endpoint.
 *                                      Arguments: - {string} query, [{any} variables].
 * @param {SectionNewsAttributes} attrs The attributes of the block
 * @param {boolean}  isEditor           Wheter the context is within the WP block editor.
 */
export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: SectionNewsAttributes | null = null,
	isEditor: boolean = false
): Promise<SectionNewsData> => {
	const query = gql`
		query sectionNewsQuery(
			$categoryIn: [ID] = []
			$offset: Int = 0
			$postIn: [ID] = []
			$size: Int = 6
			$stati: [PostStatusEnum] = [PUBLISH]
			$tagIn: [ID] = []
		) {
			posts(
				where: {
					categoryIn: $categoryIn
					in: $postIn
					offsetPagination: { offset: $offset, size: $size }
					stati: $stati
					tagIn: $tagIn
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
