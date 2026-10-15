import { gql } from '@/utils';
import type {
	PostTermsCategoriesQuery,
	PostTermsTagsQuery,
	PostTermsTagsQueryVariables,
} from '@/__generated__/graphql';
import { baseUriContext } from '@/hooks/use-base-uri';
import { nodeAtUriTags, termTags } from '@/lib/cache-tags';

export const usesBaseUri = true;

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: PostTermsAttributes | null = null
) => {
	let query;

	if (attrs?.term === 'category') {
		query = gql`
			query PostTermsCategories($uri: String!) {
				nodeByUri(uri: $uri) {
					... on ContentNode {
						databaseId
					}
					... on Post {
						categories {
							nodes {
								databaseId
								name
								uri
							}
						}
					}
				}
			}
		`;
	}

	if (attrs?.term === 'post_tag') {
		query = gql`
			query PostTermsTags($uri: String!) {
				nodeByUri(uri: $uri) {
					... on ContentNode {
						databaseId
					}
					... on Post {
						tags {
							nodes {
								databaseId
								name
								uri
							}
						}
					}
				}
			}
		`;
	}

	if (!query) return { cacheTags: [] };

	const uri = baseUriContext();

	if (!uri) return { cacheTags: [] };

	const variables = {
		uri,
	};

	const data = await fetcher<
		PostTermsCategoriesQuery | PostTermsTagsQuery,
		PostTermsTagsQueryVariables
	>(query, { variables });
	const node = data?.nodeByUri;
	const categories =
		node && 'categories' in node ? node.categories?.nodes : undefined;
	const tags = node && 'tags' in node ? node.tags?.nodes : undefined;

	return {
		categories,
		tags,
		cacheTags: [
			...nodeAtUriTags(data?.nodeByUri?.databaseId),
			...termTags(categories ?? tags),
		],
	};
};
