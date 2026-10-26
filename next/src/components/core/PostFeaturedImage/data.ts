import { baseUriContext } from '@/hooks/use-base-uri';
import { nodeAtUriTags } from '@/lib/cache-tags';
import { fetchCurrentNode } from '@/lib/current-node';
import { gql } from '@/utils';
import type {
	PostFeaturedImageByPostIdQuery,
	PostFeaturedImageByPostIdQueryVariables,
} from '@/__generated__/graphql';

export const usesBaseUri = true;

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: PostFeaturedImageAttributes | null = null
) => {
	if (attrs?.postId) {
		const query = gql`
			query PostFeaturedImageByPostId($postId: ID!) {
				post(id: $postId) {
					databaseId
					featuredImage {
						node {
							sourceUrl
							altText
							mediaDetails {
								width
								height
							}
						}
					}
				}
			}
		`;

		const variables = {
			postId: attrs?.postId,
		};

		const data = await fetcher<
			PostFeaturedImageByPostIdQuery,
			PostFeaturedImageByPostIdQueryVariables
		>(query, { variables });
		const featuredImage = data?.post?.featuredImage;

		return {
			featuredImage: featuredImage?.node,
			cacheTags: nodeAtUriTags(data?.post?.databaseId),
		};
	}

	const uri = baseUriContext();

	if (!uri) return { featuredImage: null, cacheTags: [] };

	const data = await fetchCurrentNode(fetcher, uri);

	const node = data?.nodeByUri;
	const featuredImage =
		node && 'featuredImage' in node ? node.featuredImage : null;

	return {
		featuredImage: featuredImage?.node,
		cacheTags: nodeAtUriTags(
			node && 'databaseId' in node ? node.databaseId : undefined
		),
	};
};
