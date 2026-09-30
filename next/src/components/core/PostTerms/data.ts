import { gql } from '@/utils';
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
			query nodeByIdQuery($uri: String!) {
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
			query nodeByIdQuery($uri: String!) {
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

	const variables = {
		uri,
	};

	const data = await fetcher(query, { variables });
	const categories = data?.nodeByUri?.categories?.nodes;
	const tags = data?.nodeByUri?.tags?.nodes;

	return {
		categories,
		tags,
		cacheTags: [
			...nodeAtUriTags(data?.nodeByUri?.databaseId),
			...termTags(categories ?? tags),
		],
	};
};
