import { baseUriContext } from '@/hooks/use-base-uri';
import { cacheTags } from '@/lib/cache-tags';
import { fetchCurrentNode } from '@/lib/current-node';

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

	const data = await fetchCurrentNode(fetcher, uri);
	const node = data?.nodeByUri;
	const term = node && 'termName' in node ? node : null;

	return {
		content: typeof term?.termName === 'string' ? term.termName : '',
		uri: typeof term?.termUri === 'string' ? term.termUri : null,
		cacheTags:
			typeof term?.termDatabaseId === 'number'
				? [cacheTags.term(term.termDatabaseId)]
				: [cacheTags.uris()],
	};
};
