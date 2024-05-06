import * as cardNewsData from '@/components/molecules/cards/CardNews/data';

import {
	languageFields,
	translationsFields,
	seoPostTypeFragment,
} from '@/lib/fragments';
import { FetchApiFuncType } from '@/lib/fetch-api';
import { gql } from '@/utils';

export const slug = 'single-post';

export const fragment = gql`
	fragment singlePostFragment on Post {
		id: databaseId
		title(format: RENDERED)
		date
		blocksJSON
		uri

		featuredImage {
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

		categories(first: 1 where: { exclude: [1]}) {
			nodes {
				id: databaseId
				name
				uri
			}
		}
		tags {
			nodes {
				id: databaseId
				name
				uri
			}
		}

		editLink @include(if: $isPreview)
		preview @include(if: $isPreviewDraft) {
			node {
				blocksJSON
			}
		}
		seo {
			...seoPostTypeFragment
		}

		relatedPosts {
			size: perPage
			categoryIn
			tagIn
			notIn
		}

		${languageFields}
		${translationsFields}
	}
	${seoPostTypeFragment}
`;

export const formatter = ({ posts, readingSettings }: any) => ({
	relatedPosts: posts.nodes.map(cardNewsData.formatter),
	postsPage: readingSettings.postsPage,
});

export const getData = async (fetcher: FetchApiFuncType, node: any = null) => {
	const query = gql`
		query singlePostQuery(
			$size: Int = 3
			$categoryIn: [ID] = []
			$tagIn: [ID] = []
			$notIn: [ID] = []
		) {
			posts(
				where: {
					offsetPagination: { size: $size }
					categoryIn: $categoryIn
					tagIn: $tagIn
					notIn: $notIn
				}
			) {
				nodes {
					...cardNewsFragment
				}
			}
			readingSettings {
				postsPage {
					uri
				}
			}
		}

		${cardNewsData.fragment}
	`;

	const variables = node.relatedPosts;

	const data = await fetcher(query, { variables });

	return formatter(data);
};
