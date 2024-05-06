import * as cardNewsData from '@/components/molecules/cards/CardNews/data';

import {
	languageFields,
	translationsFields,
	seoTaxFragment,
} from '@/lib/fragments';
import { FetchApiFuncType } from '@/lib/fetch-api';
import { gql } from '@/utils';

import { singlePageData, archivePostData } from '@/components/templates/data';

export const termNodeFragment = gql`
	fragment termNodeFragment on TermNode {
		id: databaseId
		title: name
		href: uri
	}
`;

export const slug = 'single-category';

export const fragment = gql`
	fragment singleCategoryFragment on Category {
		id: databaseId
		title: name
		uri
		description
		archivePage {
			baseUri
			perPage
			type
		}

		seo {
			...seoTaxFragment
		}
		${languageFields}
		${translationsFields}
	}
	${seoTaxFragment}
`;

export const getData = async (fetcher: FetchApiFuncType, node: any) => {
	const query = gql`
		query singleCategoryQuery(
			$categoryIn: [ID]!
			$size: Int = 10
			$offset: Int = 0
			$isPreview: Boolean = false
			$isPreviewDraft: Boolean = false
		) {
			posts(
				where: {
					categoryIn: $categoryIn
					offsetPagination: { size: $size, offset: $offset }
				}
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
			readingSettings {
				postsPage {
					...singlePageFragment
				}
			}
		}

		${cardNewsData.fragment}
		${singlePageData.fragment}
		${termNodeFragment}
	`;

	if (!node.fullUri) throw new Error('Node must have a fullUri');

	const uriSplitted = node.fullUri.split('/');
	const currentPageNum = Number.parseInt(uriSplitted.slice(-2).join(''));
	const pageNum = isNaN(currentPageNum) ? 1 : currentPageNum;

	const pageSize = node?.archivePage?.perPage ?? 9;

	const variables = {
		categoryIn: [node.id],
		size: pageSize,
		offset: pageSize * pageNum - pageSize,
	};

	const data = await fetcher(query, { variables });

	const { posts, categories, tags, readingSettings } = data;

	return {
		blocksJSON: JSON.parse(readingSettings.postsPage.blocksJSON),
		archivePage: {
			...archivePostData.formatter(
				{ posts, categories, tags, currentPage: pageNum },
				node
			).archivePage,
			baseUri: readingSettings.postsPage.uri,
		},
	};
};
