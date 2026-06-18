import { baseUriContext } from '@/hooks/use-base-uri';
import { gql } from '@/utils';

type NavigationDirection = 'next' | 'previous';
type SupportedTaxonomy = 'category' | 'post_tag';
type SupportedNodeType = 'Post' | 'Page';
type QueryOrder = 'ASC' | 'DESC';

type NavigationCandidate = {
	databaseId: number;
	date: string;
	uri: string;
	title: string;
};

type PostContext = {
	__typename: SupportedNodeType;
	databaseId: number;
	date: string;
	categories?: { nodes?: Array<{ databaseId: number }> };
	tags?: { nodes?: Array<{ databaseId: number }> };
};

const isValidDirection = (value: unknown): value is NavigationDirection =>
	value === 'next' || value === 'previous';

const normalizeDirection = (value: unknown): NavigationDirection =>
	isValidDirection(value) ? value : 'next';

const normalizeTaxonomy = (value: unknown): SupportedTaxonomy | null => {
	if (value === 'category' || value === 'post_tag') return value;
	return null;
};

const getComparisonOperator = (direction: NavigationDirection) =>
	direction === 'next' ? 'after' : 'before';

const getOrderForDirection = (direction: NavigationDirection): QueryOrder =>
	direction === 'next' ? 'ASC' : 'DESC';

const normalizeCandidates = (nodes: unknown): NavigationCandidate[] =>
	Array.isArray(nodes)
		? nodes.filter(
				(node): node is NavigationCandidate =>
					typeof node?.databaseId === 'number' &&
					typeof node?.date === 'string' &&
					typeof node?.uri === 'string' &&
					typeof node?.title === 'string'
			)
		: [];

const pickAdjacentNode = (
	nodes: unknown,
	currentDatabaseId: number
): NavigationCandidate | null =>
	normalizeCandidates(nodes).find(
		(node) => node.databaseId !== currentDatabaseId
	) ?? null;

/** WPGraphQL `dateQuery.before` / `after` expect `DateInput`, not a plain string. */
const toWpDateInput = (
	isoDate: string
): { year: number; month: number; day: number } => {
	const d = new Date(isoDate);
	if (!Number.isFinite(d.getTime())) {
		throw new Error(`Invalid date for DateInput: ${isoDate}`);
	}
	// This project's schema exposes only `year`, `month`, `day` on `DateInput` (no time fields).
	return {
		year: d.getFullYear(),
		month: d.getMonth() + 1,
		day: d.getDate(),
	};
};

const getFallbackAdjacentNode = (
	nodes: unknown,
	current: PostContext,
	direction: NavigationDirection
): NavigationCandidate | null => {
	const currentTimestamp = new Date(current.date).getTime();
	if (!Number.isFinite(currentTimestamp)) return null;

	const sorted = normalizeCandidates(nodes).sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
	);

	if (direction === 'next') {
		return (
			sorted.find(
				(node) =>
					node.databaseId !== current.databaseId &&
					new Date(node.date).getTime() > currentTimestamp
			) ?? null
		);
	}

	for (let i = sorted.length - 1; i >= 0; i -= 1) {
		const node = sorted[i];
		if (node.databaseId === current.databaseId) continue;
		if (new Date(node.date).getTime() < currentTimestamp) return node;
	}

	return null;
};

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: PostNavigationLinkAttributes | null = null
) => {
	const direction = normalizeDirection(attrs?.type);
	const taxonomy = normalizeTaxonomy(attrs?.taxonomy);

	const postContextQuery = gql`
		query PostNavigationLinkContext($uri: String!) {
			nodeByUri(uri: $uri) {
				__typename
				... on Post {
					databaseId
					date
					categories {
						nodes {
							databaseId
						}
					}
					tags {
						nodes {
							databaseId
						}
					}
				}
				... on Page {
					databaseId
					date
				}
			}
		}
	`;

	const uri = baseUriContext();
	const contextData = await fetcher(postContextQuery, {
		variables: { uri },
	});
	const currentNode = contextData?.nodeByUri as PostContext | null;

	if (
		!currentNode?.__typename ||
		!currentNode?.databaseId ||
		!currentNode?.date
	) {
		return { navigationPost: null };
	}

	const categoryIn =
		taxonomy === 'category'
			? currentNode?.categories?.nodes
					?.map((term: { databaseId: number }) =>
						Number(term.databaseId)
					)
					.filter((id: number) => Number.isFinite(id) && id > 0)
			: null;

	const tagIn =
		taxonomy === 'post_tag'
			? currentNode?.tags?.nodes
					?.map((term: { databaseId: number }) =>
						Number(term.databaseId)
					)
					.filter((id: number) => Number.isFinite(id) && id > 0)
			: null;

	const order = getOrderForDirection(direction);
	const comparisonOperator = getComparisonOperator(direction);

	const postAdjacentQuery = gql`
    query PostNavigationLinkAdjacentPost(
      $date: DateInput!
      $order: OrderEnum!
      $categoryIn: [ID]
      $tagIn: [ID]
      $notIn: [ID]
    ) {
      posts(
        first: 1
        where: {
          orderby: { field: DATE, order: $order }
          stati: PUBLISH
          dateQuery: { ${comparisonOperator}: $date }
          categoryIn: $categoryIn
          tagIn: $tagIn
          notIn: $notIn
        }
      ) {
        nodes {
          databaseId
          date
          uri
          title(format: RENDERED)
        }
      }
    }
  `;

	const pageAdjacentQuery = gql`
    query PostNavigationLinkAdjacentPage(
      $date: DateInput!
      $order: OrderEnum!
      $notIn: [ID]
    ) {
      pages(
        first: 1
        where: {
          orderby: { field: DATE, order: $order }
          dateQuery: { ${comparisonOperator}: $date }
          notIn: $notIn
        }
      ) {
        nodes {
          databaseId
          date
          uri
          title(format: RENDERED)
        }
      }
    }
  `;

	const fallbackPostsQuery = gql`
		query PostNavigationLinkFallbackPosts(
			$categoryIn: [ID]
			$tagIn: [ID]
			$notIn: [ID]
		) {
			posts(
				first: 20
				where: {
					orderby: { field: DATE, order: ASC }
					stati: PUBLISH
					categoryIn: $categoryIn
					tagIn: $tagIn
					notIn: $notIn
				}
			) {
				nodes {
					databaseId
					date
					uri
					title(format: RENDERED)
				}
			}
		}
	`;

	const fallbackPagesQuery = gql`
		query PostNavigationLinkFallbackPages($notIn: [ID]) {
			pages(
				first: 20
				where: { orderby: { field: DATE, order: ASC }, notIn: $notIn }
			) {
				nodes {
					databaseId
					date
					uri
					title(format: RENDERED)
				}
			}
		}
	`;

	const commonVariables = {
		date: toWpDateInput(currentNode.date),
		order,
		notIn: [currentNode.databaseId],
	};

	let adjacentPost: NavigationCandidate | null = null;

	try {
		if (currentNode.__typename === 'Post') {
			const postData = await fetcher(postAdjacentQuery, {
				variables: {
					...commonVariables,
					categoryIn: categoryIn?.length ? categoryIn : null,
					tagIn: tagIn?.length ? tagIn : null,
				},
			});
			adjacentPost = pickAdjacentNode(
				postData?.posts?.nodes,
				currentNode.databaseId
			);
		} else {
			const pageData = await fetcher(pageAdjacentQuery, {
				variables: commonVariables,
			});
			adjacentPost = pickAdjacentNode(
				pageData?.pages?.nodes,
				currentNode.databaseId
			);
		}
	} catch {
		if (currentNode.__typename === 'Post') {
			const fallbackData = await fetcher(fallbackPostsQuery, {
				variables: {
					categoryIn: categoryIn?.length ? categoryIn : null,
					tagIn: tagIn?.length ? tagIn : null,
					notIn: [currentNode.databaseId],
				},
			});
			adjacentPost = getFallbackAdjacentNode(
				fallbackData?.posts?.nodes,
				currentNode,
				direction
			);
		} else {
			const fallbackData = await fetcher(fallbackPagesQuery, {
				variables: {
					notIn: [currentNode.databaseId],
				},
			});
			adjacentPost = getFallbackAdjacentNode(
				fallbackData?.pages?.nodes,
				currentNode,
				direction
			);
		}
	}

	if (!adjacentPost) return { navigationPost: null };

	return {
		navigationPost: {
			uri: adjacentPost.uri,
			title: adjacentPost.title,
			type: direction,
		},
	};
};
