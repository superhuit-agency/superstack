import { baseUriContext } from '@/hooks/use-base-uri';
import { gql } from '@/utils';

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: TermNameAttributes | null = null,
	lang: string | null = null,
	context: BlockDataContext | null = null
) => {
	void attrs;
	void lang;

	const uri = context?.baseUri ?? baseUriContext();

	if (!uri || typeof uri !== 'string') return { content: '' };

	const query = gql`
		query TermNameData($uri: String!) {
			nodeByUri(uri: $uri) {
				... on TermNode {
					name
					uri
				}
			}
		}
	`;

	const data = await fetcher(query, { variables: { uri } });
	const node = data?.nodeByUri;

	return {
		content: typeof node?.name === 'string' ? node.name : '',
		uri: typeof node?.uri === 'string' ? node.uri : null,
	};
};
