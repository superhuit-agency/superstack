import { baseUriContext } from '@/hooks/use-base-uri';
import { nodeAtUriTags } from '@/lib/cache-tags';
import { fetchCurrentNode } from '@/lib/current-node';

export const usesBaseUri = true;

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: PostTitleAttributes | null = null
) => {
	void attrs;

	const uri = baseUriContext();

	if (!uri) return { content: '', cacheTags: [] };

	const data = await fetchCurrentNode(fetcher, uri);
	const node = data?.nodeByUri;
	const title = node && 'title' in node ? node.title : null;

	return {
		content: typeof title === 'string' ? title : '',
		cacheTags: nodeAtUriTags(
			node && 'databaseId' in node ? node.databaseId : undefined
		),
	};
};
