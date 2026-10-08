import { baseUriContext } from '@/hooks/use-base-uri';
import { nodeAtUriTags } from '@/lib/cache-tags';
import { gql } from '@/utils';

export const usesBaseUri = true;

export const getData = async (fetcher: FetchApiFuncType) => {
	const query = gql`
		query nodeByUriQuery($uri: String!) {
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

	const data = await fetcher(query, { variables });
	const author = data?.nodeByUri?.author;

	return {
		author: author?.node,
		cacheTags: nodeAtUriTags(data?.nodeByUri?.databaseId),
	};
};
