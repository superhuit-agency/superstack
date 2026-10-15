import { baseUriContext } from '@/hooks/use-base-uri';
import { nodeAtUriTags } from '@/lib/cache-tags';
import { gql } from '@/utils';
import type {
	PostExcerptDataQuery,
	PostExcerptDataQueryVariables,
} from '@/__generated__/graphql';

export const usesBaseUri = true;

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: PostExcerptAttributes | null = null
) => {
	void attrs;

	const query = gql`
		query PostExcerptData($uri: String!) {
			nodeByUri(uri: $uri) {
				... on ContentNode {
					databaseId
				}
				... on Post {
					excerpt(format: RENDERED)
				}
				... on Page {
					excerpt(format: RENDERED)
				}
			}
		}
	`;

	const uri = baseUriContext();

	if (!uri) return { content: '', cacheTags: [] };

	const variables = {
		uri: uri,
	};

	const data = await fetcher<
		PostExcerptDataQuery,
		PostExcerptDataQueryVariables
	>(query, { variables });
	const node = data?.nodeByUri;
	const excerpt = node && 'excerpt' in node ? node.excerpt : null;

	return {
		content: typeof excerpt === 'string' ? excerpt : '',
		cacheTags: nodeAtUriTags(data?.nodeByUri?.databaseId),
	};
};
