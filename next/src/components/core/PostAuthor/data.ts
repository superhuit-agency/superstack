import { baseUriContext } from '@/hooks/use-base-uri';
import { nodeAtUriTags } from '@/lib/cache-tags';
import { gql } from '@/utils';
import type {
	PostAuthorDataQuery,
	PostAuthorDataQueryVariables,
} from '@/__generated__/graphql';

export const usesBaseUri = true;

export const getData = async (fetcher: FetchApiFuncType) => {
	const query = gql`
		query PostAuthorData($uri: String!) {
			nodeByUri(uri: $uri) {
				... on ContentNode {
					databaseId
				}
				... on Post {
					author {
						node {
							name
							avatar {
								url
							}
						}
					}
				}
				... on Page {
					author {
						node {
							name
							description
							avatar {
								url
							}
						}
					}
				}
			}
		}
	`;

	const uri = baseUriContext();

	if (!uri) return { author: null, cacheTags: [] };

	const variables = {
		uri,
	};

	const data = await fetcher<
		PostAuthorDataQuery,
		PostAuthorDataQueryVariables
	>(query, { variables });
	const node = data?.nodeByUri;
	const author = node && 'author' in node ? node.author : null;

	return {
		author: author?.node,
		cacheTags: nodeAtUriTags(node?.databaseId),
	};
};
