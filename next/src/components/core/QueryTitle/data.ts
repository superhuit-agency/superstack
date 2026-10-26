import { baseUriContext } from '@/hooks/use-base-uri';
import { cacheTags } from '@/lib/cache-tags';
import { fetchCurrentNode } from '@/lib/current-node';

const archivePrefix = (type: string): string => {
	if (type === 'archive') return 'Archives';
	if (type === 'post-type') return 'Post Type';
	return '';
};

export const usesBaseUri = true;

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: QueryTitleAttributes | null = null
) => {
	const type = attrs?.type ?? 'archive';
	const showPrefix = attrs?.showPrefix ?? true;

	// The search term is in the query string, which the Base URI doesn't
	// carry and the cached block data can't read
	if (type === 'search') return { content: 'Search results', cacheTags: [] };

	const uri = baseUriContext();

	if (!uri) return { content: '', cacheTags: [] };

	const data = await fetchCurrentNode(fetcher, uri);
	const node = data?.nodeByUri;

	const tags = !node
		? [cacheTags.uris()]
		: 'termDatabaseId' in node && typeof node.termDatabaseId === 'number'
			? [cacheTags.term(node.termDatabaseId)]
			: [];

	const name: string =
		node && 'label' in node && typeof node.label === 'string'
			? node.label
			: node && 'termName' in node && typeof node.termName === 'string'
				? node.termName
				: node &&
					  'userName' in node &&
					  typeof node.userName === 'string'
					? node.userName
					: '';

	if (!name) return { content: '', cacheTags: tags };

	if (showPrefix) {
		const prefix = archivePrefix(type);
		return {
			content: prefix ? `${prefix}: ${name}` : name,
			cacheTags: tags,
		};
	}

	return { content: name, cacheTags: tags };
};
