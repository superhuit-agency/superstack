import { baseUriContext } from '@/hooks/use-base-uri';
import { nodeAtUriTags } from '@/lib/cache-tags';
import { gql } from '@/utils';

export const usesBaseUri = true;

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: PostFeaturedImageAttributes | null = null
) => {
	if (attrs?.postId) {
		const query = gql`
			query PostFeaturedImageData($postId: ID!) {
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

		const data = await fetcher(query, { variables });
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

	const variables = {
		uri: uri,
	};

	const data = await fetcher(query, { variables });

	const featuredImage = data?.nodeByUri?.featuredImage;

	return {
		featuredImage: featuredImage?.node,
		cacheTags: nodeAtUriTags(data?.nodeByUri?.databaseId),
	};
};
