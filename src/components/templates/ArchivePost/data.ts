import * as cardNewsData from '@/components/molecules/cards/CardNews/data';
import { termNodeFragment } from '@/components/templates/SingleCategory/data';
import { FetchApiFuncType } from '@/lib/fetch-api';
import { gql } from '@/utils';

export const slug = 'archive-post';

/**
 * Formatter function for the archive post template
 */

const NB_PER_PAGE = 9;

export const formatter = (data: any, node: any) => {
	const { posts, categories, tags, currentPage } = data;

	const { uri, archivePage } = node;

	return {
		archivePage: {
			perPage: NB_PER_PAGE,
			...archivePage,
			posts: posts.nodes.map((n: any) => cardNewsData.formatter(n)),
			pagination: {
				current: currentPage,
				total:
					posts.pageInfo.offsetPagination.total /
					(archivePage?.perPage || NB_PER_PAGE),
			},
			categories: categories.nodes.map((t: any) => ({
				...t,
				isActive: t.href === uri,
			})),
			tags: tags.nodes.map((t: any) => ({
				...t,
				isActive: t.href === uri,
			})),
		},
	};
};

export type ArchivePostData = ReturnType<typeof formatter>;

/**
 * GraphQL data fetching.
 * Should return the final props needed for the template
 *
 * @param {Function} fetcher The context based function to request the GraphQl endpoint.
 *                             Arguments: - {string} query, [{any} variable].
 * @param {Node}      node    The node data retrieved from the NodeByUri/NodeById query
 */
export const getData = async (
	fetcher: FetchApiFuncType,
	node: any
): Promise<any> => {
	const query = gql`
		query archivePostQuery($size: Int = 10, $offset: Int = 0) {
			posts(
				where: { offsetPagination: { size: $size, offset: $offset } }
			) {
				nodes {
					...cardNewsFragment
				}
				pageInfo {
					offsetPagination {
						total
					}
				}
			}
			categories(first: 99, where: { hideEmpty: true }) {
				nodes {
					...termNodeFragment
				}
			}
			tags(first: 99, where: { hideEmpty: true }) {
				nodes {
					...termNodeFragment
				}
			}
		}
		${cardNewsData.fragment}
		${termNodeFragment}
	`;

	const uriSplitted = node.fullUri?.split('/');
	if (!uriSplitted) throw new Error('No uri found');

	const currentPageNum = Number.parseInt(uriSplitted?.slice(-2).join(''));
	const pageNum = isNaN(currentPageNum) ? 1 : currentPageNum;

	const pageSize = node?.archivePage?.perPage ?? 9;

	const variables = {
		size: pageSize,
		offset: pageSize * pageNum - pageSize,
	};

	const data = await fetcher(query, { variables });

	return formatter({ ...data, currentPage: pageNum }, node);
};
