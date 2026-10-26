import { baseUriContext } from '@/hooks/use-base-uri';
import { cacheTags, nodeAtUriTags } from '@/lib/cache-tags';
import { fetchCurrentNode } from '@/lib/current-node';
import { gql } from '@/utils';
import type {
	PostNavigationLinkAdjacentPageQuery,
	PostNavigationLinkAdjacentPageQueryVariables,
	PostNavigationLinkAdjacentPostQuery,
	PostNavigationLinkAdjacentPostQueryVariables,
} from '@/__generated__/graphql';

type NavigationDirection = 'next' | 'previous';
type SupportedTaxonomy = 'category' | 'post_tag';
type QueryOrder = 'ASC' | 'DESC';

type NavigationCandidate = {
	databaseId: number;
	date: string;
	uri: string;
	title: string;
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

export const usesBaseUri = true;

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: PostNavigationLinkAttributes | null = null
) => {
	const direction = normalizeDirection(attrs?.type);
	const taxonomy = normalizeTaxonomy(attrs?.taxonomy);

	const uri = baseUriContext();

	if (!uri) return { navigationPost: null, cacheTags: [] };

	const contextData = await fetchCurrentNode(fetcher, uri);
	const node = contextData?.nodeByUri;
	const currentNode =
		node?.__typename === 'Post' || node?.__typename === 'Page'
			? node
			: null;

	if (
		!currentNode?.__typename ||
		!currentNode?.databaseId ||
		!currentNode?.date
	) {
		return {
			navigationPost: null,
			cacheTags: nodeAtUriTags(currentNode?.databaseId),
		};
	}

	const tags = [
		cacheTags.node(currentNode.databaseId),
		cacheTags.type(currentNode.__typename === 'Post' ? 'post' : 'page'),
	];

	const categoryIn =
		taxonomy === 'category' && currentNode.__typename === 'Post'
			? currentNode.categories?.nodes
					?.map((term: { databaseId: number }) =>
						Number(term.databaseId)
					)
					.filter((id: number) => Number.isFinite(id) && id > 0)
			: null;

	const tagIn =
		taxonomy === 'post_tag' && currentNode.__typename === 'Post'
			? currentNode.tags?.nodes
					?.map((term: { databaseId: number }) =>
						Number(term.databaseId)
					)
					.filter((id: number) => Number.isFinite(id) && id > 0)
			: null;

	const order = getOrderForDirection(direction);
	const comparisonOperator = getComparisonOperator(direction);

	const postAdjacentQuery = gql`
		query PostNavigationLinkAdjacentPost(
			$before: DateInput
			$after: DateInput
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
					dateQuery: { before: $before, after: $after }
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
			$before: DateInput
			$after: DateInput
			$order: OrderEnum!
			$notIn: [ID]
		) {
			pages(
				first: 1
				where: {
					orderby: { field: DATE, order: $order }
					dateQuery: { before: $before, after: $after }
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

	// Only the bound of the direction is sent: a variable left out leaves its
	// `dateQuery` field out
	const date = toWpDateInput(currentNode.date);
	const commonVariables = {
		...(comparisonOperator === 'after'
			? { after: date }
			: { before: date }),
		order,
		notIn: [currentNode.databaseId],
	};

	let adjacentPost: NavigationCandidate | null = null;

	if (currentNode.__typename === 'Post') {
		const postData = await fetcher<
			PostNavigationLinkAdjacentPostQuery,
			PostNavigationLinkAdjacentPostQueryVariables
		>(postAdjacentQuery, {
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
		const pageData = await fetcher<
			PostNavigationLinkAdjacentPageQuery,
			PostNavigationLinkAdjacentPageQueryVariables
		>(pageAdjacentQuery, {
			variables: commonVariables,
		});
		adjacentPost = pickAdjacentNode(
			pageData?.pages?.nodes,
			currentNode.databaseId
		);
	}

	if (!adjacentPost) return { navigationPost: null, cacheTags: tags };

	return {
		navigationPost: {
			uri: adjacentPost.uri,
			title: adjacentPost.title,
			type: direction,
		},
		cacheTags: tags,
	};
};
