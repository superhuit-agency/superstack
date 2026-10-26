import { baseUriContext } from '@/hooks/use-base-uri';
import { nodeAtUriTags } from '@/lib/cache-tags';
import { fetchCurrentNode } from '@/lib/current-node';

export const usesBaseUri = true;

export const getData = async (fetcher: FetchApiFuncType) => {
	const uri = baseUriContext();

	if (!uri) return { name: null, uri: null, cacheTags: [] };

	const data = await fetchCurrentNode(fetcher, uri);
	const node = data?.nodeByUri;
	const name = node && 'author' in node ? node.author?.node?.name : undefined;

	return {
		name: name,
		uri: uri,
		cacheTags: nodeAtUriTags(
			node && 'databaseId' in node ? node.databaseId : undefined
		),
	};
};
