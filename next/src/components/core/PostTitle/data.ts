import { baseUriContext } from '@/hooks/use-base-uri';
import { nodeAtUriTags } from '@/lib/cache-tags';
import { gql } from '@/utils';

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

	const variables = {
		uri: uri,
	};

	const data = await fetcher(query, { variables });
	const title = data?.nodeByUri?.title;

	return {
		content: typeof title === 'string' ? title : '',
		cacheTags: nodeAtUriTags(data?.nodeByUri?.databaseId),
	};
};
