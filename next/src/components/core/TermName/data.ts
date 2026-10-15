import { baseUriContext } from '@/hooks/use-base-uri';
import { cacheTags } from '@/lib/cache-tags';
import { gql } from '@/utils';
import type {
	TermNameDataQuery,
	TermNameDataQueryVariables,
} from '@/__generated__/graphql';

export const usesBaseUri = true;

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: TermNameAttributes | null = null,
	lang: string | null = null
) => {
	void attrs;
	void lang;

	const uri = baseUriContext();

	if (!uri || typeof uri !== 'string') return { content: '', cacheTags: [] };

	const query = gql`
		query TermNameData($uri: String!) {
			nodeByUri(uri: $uri) {
				... on TermNode {
					databaseId
					name
					uri
				}
			}
		}
	`;

	const data = await fetcher<TermNameDataQuery, TermNameDataQueryVariables>(
		query,
		{ variables: { uri } }
	);
	const node = data?.nodeByUri;

	return {
		content: typeof node?.name === 'string' ? node.name : '',
		uri: typeof node?.uri === 'string' ? node.uri : null,
		cacheTags:
			typeof node?.databaseId === 'number'
				? [cacheTags.term(node.databaseId)]
				: [cacheTags.uris()],
	};
};
