import { baseUriContext } from '@/hooks/use-base-uri';
import { nodeAtUriTags } from '@/lib/cache-tags';
import { gql } from '@/utils';
import type {
	PostFeaturedImageByPostIdQuery,
	PostFeaturedImageByPostIdQueryVariables,
	PostFeaturedImageDataQuery,
	PostFeaturedImageDataQueryVariables,
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

	const query = gql`
		query PostFeaturedImageData($uri: String!) {
			nodeByUri(uri: $uri) {
				... on ContentNode {
					databaseId
				}
				... on Post {
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
				... on Page {
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
		}
	`;

	const uri = baseUriContext();

	if (!uri) return { featuredImage: null, cacheTags: [] };

	const variables = {
		uri: uri,
	};

	const data = await fetcher<
		PostFeaturedImageDataQuery,
		PostFeaturedImageDataQueryVariables
	>(query, { variables });

	const node = data?.nodeByUri;
	const featuredImage =
		node && 'featuredImage' in node ? node.featuredImage : null;

	return {
		featuredImage: featuredImage?.node,
		cacheTags: nodeAtUriTags(node?.databaseId),
	};
};
