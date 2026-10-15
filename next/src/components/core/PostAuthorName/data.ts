import { baseUriContext } from '@/hooks/use-base-uri';
import { nodeAtUriTags } from '@/lib/cache-tags';
import { gql } from '@/utils';
import type {
	PostAuthorNameDataQuery,
	PostAuthorNameDataQueryVariables,
} from '@/__generated__/graphql';

export const usesBaseUri = true;

export const getData = async (fetcher: FetchApiFuncType) => {
	const query = gql`
		query PostAuthorNameData($uri: String!) {
			nodeByUri(uri: $uri) {
				... on ContentNode {
					databaseId
				}
				... on Post {
					author {
						node {
							name
						}
					}
				}
				... on Page {
					author {
						node {
							name
							uri
						}
					}
				}
			}
		}
	`;

	const uri = baseUriContext();

	if (!uri) return { name: null, uri: null, cacheTags: [] };

	const variables = {
		uri: uri,
	};

	const data = await fetcher<
		PostAuthorNameDataQuery,
		PostAuthorNameDataQueryVariables
	>(query, { variables });
	const node = data?.nodeByUri;
	const name = node && 'author' in node ? node.author?.node?.name : undefined;

	return {
		name: name,
		uri: uri,
		cacheTags: nodeAtUriTags(node?.databaseId),
	};
};
