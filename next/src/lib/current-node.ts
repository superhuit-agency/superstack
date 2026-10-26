import { gql } from '@/utils';
import type {
	CurrentNodeQuery,
	CurrentNodeQueryVariables,
} from '@/__generated__/graphql';

const currentNodeFeaturedImageFragment = gql`
	fragment CurrentNodeFeaturedImage on NodeWithFeaturedImage {
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
`;

/**
 * The node at the Base URI, with what the blocks displaying it read
 * (`core/post-title`, `core/post-date`, `core/term-name`…).
 *
 * Every one of those blocks sends this exact query, so that `fetchAPI`
 * shares a single round-trip between them instead of one per block.
 *
 * A term's fields are aliased, and so is a user's name: a block reading a
 * post's `databaseId` or `uri` must not find a term's on a term archive.
 *
 * Kept free of `next/*` imports: block data modules are also bundled into
 * the WordPress block editor.
 */
export const currentNodeQuery = gql`
	query CurrentNode($uri: String!) {
		generalSettings {
			dateFormat
		}
		nodeByUri(uri: $uri) {
			__typename
			... on ContentNode {
				databaseId
			}
			... on Post {
				title(format: RENDERED)
				date
				modified
				uri
				...CurrentNodeFeaturedImage
				author {
					node {
						name
						avatar {
							url
						}
					}
				}
				categories {
					nodes {
						databaseId
						name
						uri
					}
				}
				tags {
					nodes {
						databaseId
						name
						uri
					}
				}
			}
			... on Page {
				title(format: RENDERED)
				date
				modified
				uri
				...CurrentNodeFeaturedImage
				author {
					node {
						name
						description
						uri
						avatar {
							url
						}
					}
				}
			}
			... on TermNode {
				termDatabaseId: databaseId
				termName: name
				termUri: uri
				taxonomyName
			}
			... on ContentType {
				label
			}
			... on User {
				userName: name
			}
		}
	}
	${currentNodeFeaturedImageFragment}
`;

/**
 * Reads the node at the Base URI (see `currentNodeQuery`).
 *
 * @param fetcher The block's fetcher
 * @param uri     The Base URI
 *
 * @returns `{ generalSettings, nodeByUri }`
 */
export const fetchCurrentNode = (fetcher: FetchApiFuncType, uri: string) =>
	fetcher<CurrentNodeQuery, CurrentNodeQueryVariables>(currentNodeQuery, {
		variables: { uri },
	});
