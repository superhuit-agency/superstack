import { baseUriContext } from '@/hooks/use-base-uri';
import { nodeAtUriTags } from '@/lib/cache-tags';
import { gql } from '@/utils';
import type {
	PostTitleDataQuery,
	PostTitleDataQueryVariables,
} from '@/__generated__/graphql';

export const usesBaseUri = true;

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: PostTitleAttributes | null = null
) => {
	void attrs;

	const query = gql`
		query PostTitleData($uri: String!) {
			nodeByUri(uri: $uri) {
				... on ContentNode {
					databaseId
				}
				... on Page {
					title(format: RENDERED)
				}
				... on Post {
					title(format: RENDERED)
				}
			}
		}
	`;

	const uri = baseUriContext();

	if (!uri) return { content: '', cacheTags: [] };

	const variables = {
		uri: uri,
	};

	const data = await fetcher<PostTitleDataQuery, PostTitleDataQueryVariables>(
		query,
		{ variables }
	);
	const node = data?.nodeByUri;
	const title = node && 'title' in node ? node.title : null;

	return {
		content: typeof title === 'string' ? title : '',
		cacheTags: nodeAtUriTags(data?.nodeByUri?.databaseId),
	};
};
