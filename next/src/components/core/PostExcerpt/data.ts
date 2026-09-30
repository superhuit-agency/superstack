import { baseUriContext } from '@/hooks/use-base-uri';
import { nodeAtUriTags } from '@/lib/cache-tags';
import { gql } from '@/utils';

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

	const variables = {
		uri: uri,
	};

	const data = await fetcher(query, { variables });
	const excerpt = data?.nodeByUri?.excerpt;

	return {
		content: typeof excerpt === 'string' ? excerpt : '',
		cacheTags: nodeAtUriTags(data?.nodeByUri?.databaseId),
	};
};
