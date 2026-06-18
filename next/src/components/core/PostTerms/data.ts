import { gql } from '@/utils';
import { baseUriContext } from '@/hooks/use-base-uri';

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: PostTermsAttributes | null = null
) => {
	let query;

	if (attrs?.term === 'category') {
		query = gql`
			query nodeByIdQuery($uri: String!) {
				nodeByUri(uri: $uri) {
					... on Post {
						categories {
							nodes {
								name
								uri
							}
						}
					}
				}
			}
		`;
	}

	if (attrs?.term === 'post_tag') {
		query = gql`
			query nodeByIdQuery($uri: String!) {
				nodeByUri(uri: $uri) {
					... on Post {
						tags {
							nodes {
								name
								uri
							}
						}
					}
				}
			}
		`;
	}

	if (!query) return;

	const uri = baseUriContext();

	const variables = {
		uri,
	};

	const data = await fetcher(query, { variables });
	const categories = data?.nodeByUri?.categories?.nodes;
	const tags = data?.nodeByUri?.tags?.nodes;

	return { categories, tags };
};
