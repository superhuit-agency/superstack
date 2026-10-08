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

	const data = await fetcher(query, { variables });
	const name = data?.nodeByUri?.author?.node?.name;

	return {
		name: name,
		uri: uri,
		cacheTags: nodeAtUriTags(data?.nodeByUri?.databaseId),
	};
};
