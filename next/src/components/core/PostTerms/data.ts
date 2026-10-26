import { baseUriContext } from '@/hooks/use-base-uri';
import { nodeAtUriTags, termTags } from '@/lib/cache-tags';
import { fetchCurrentNode } from '@/lib/current-node';

export const usesBaseUri = true;

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: PostTermsAttributes | null = null
) => {
	const isCategory = attrs?.term === 'category';

	if (!isCategory && attrs?.term !== 'post_tag') return { cacheTags: [] };

	const uri = baseUriContext();

	if (!uri) return { cacheTags: [] };

	const data = await fetchCurrentNode(fetcher, uri);
	const node = data?.nodeByUri;
	const post = node?.__typename === 'Post' ? node : null;
	// The shared read has both: keep only the taxonomy the block shows
	const categories = isCategory ? post?.categories?.nodes : undefined;
	const tags = isCategory ? undefined : post?.tags?.nodes;

	return {
		categories,
		tags,
		cacheTags: [
			...nodeAtUriTags(
				node && 'databaseId' in node ? node.databaseId : undefined
			),
			...termTags(categories ?? tags),
		],
	};
};
