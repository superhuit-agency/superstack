import { baseUriContext } from '@/hooks/use-base-uri';
import { gql } from '@/utils';

import { taxonomyToGraphqlEnum } from '@/components/core/TaxonomyList/helper';

const DEFAULT_TERM_QUERY: TermQueryType = {
	hideEmpty: true,
	include: [],
	inherit: false,
	order: 'asc',
	orderBy: 'name',
	perPage: 10,
	showNested: false,
	taxonomy: 'category',
};

const mergeTermQuery = (
	partial?: Partial<TermQueryType> | null
): TermQueryType => ({
	...DEFAULT_TERM_QUERY,
	...partial,
	include: Array.isArray(partial?.include)
		? partial!.include
		: DEFAULT_TERM_QUERY.include,
});

const toOrderEnum = (value?: string) => {
	const u = value?.toUpperCase();
	return u === 'DESC' ? 'DESC' : 'ASC';
};

const toTermOrderByEnum = (
	orderBy: TermQueryType['orderBy'],
	hasInclude: boolean
): string => {
	if (hasInclude) return 'TERM_ORDER';
	const u = orderBy?.toLowerCase();
	if (u === 'slug') return 'SLUG';
	if (u === 'count') return 'COUNT';
	return 'NAME';
};

const toPositiveInt = (value: unknown) => {
	if (typeof value === 'number' && Number.isFinite(value))
		return Math.trunc(value);
	if (typeof value === 'string' && value.trim()) {
		const n = Number.parseInt(value, 10);
		return Number.isNaN(n) ? null : n;
	}
	return null;
};

const normalizeIncludeIds = (include: string[]): string[] => {
	const ids = include
		.map((id) => toPositiveInt(id))
		.filter((id): id is number => typeof id === 'number' && id > 0);
	return [...new Set(ids)].map(String);
};

/** Mirrors `is_taxonomy_hierarchical()` for common WP taxonomies (extend as needed). */
const isTaxonomyHierarchical = (taxonomySlug: string): boolean => {
	const s = taxonomySlug.toLowerCase();
	if (s === 'post_tag' || s === 'tag') return false;
	if (s === 'post_format' || s === 'postformat') return false;
	if (s === 'category') return true;
	return true;
};

type TermArchiveContext = {
	databaseId: number;
	taxonomyName: string;
};

const fetchTermArchiveContext = async (
	fetcher: FetchApiFuncType
): Promise<TermArchiveContext | null> => {
	const uri = baseUriContext();
	if (typeof uri !== 'string' || !uri) return null;

	const query = gql`
		query TermsQueryArchiveContext($uri: String!) {
			nodeByUri(uri: $uri) {
				__typename
				... on TermNode {
					databaseId
					taxonomyName
				}
			}
		}
	`;

	const data = await fetcher(query, { variables: { uri } });
	const node = data?.nodeByUri;
	if (
		!node ||
		typeof node.databaseId !== 'number' ||
		typeof node.taxonomyName !== 'string'
	) {
		return null;
	}
	return {
		databaseId: node.databaseId,
		taxonomyName: node.taxonomyName,
	};
};

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: TermsQueryAttributes | null = null
) => {
	const termQuery = mergeTermQuery(attrs?.termQuery ?? null);
	const first = Math.min(
		100,
		Math.max(1, toPositiveInt(termQuery.perPage) ?? 10)
	);

	const includeIds = normalizeIncludeIds(termQuery.include ?? []);
	const hasInclude = includeIds.length > 0;

	let taxonomies: string[] = [];
	let parent: number | undefined;
	let childOf: number | undefined;

	const archiveContext = termQuery.inherit
		? await fetchTermArchiveContext(fetcher)
		: null;

	if (archiveContext) {
		const ctx = archiveContext;
		const taxSlug = ctx.taxonomyName.toLowerCase();
		taxonomies = [taxonomyToGraphqlEnum(taxSlug)];

		if (isTaxonomyHierarchical(taxSlug)) {
			if (termQuery.showNested) {
				childOf = ctx.databaseId;
			} else {
				parent = ctx.databaseId;
			}
		}
	} else {
		taxonomies = [taxonomyToGraphqlEnum(termQuery.taxonomy)];

		if (hasInclude) {
			// WP: include + orderby include + asc; other filters ignored.
		} else if (
			isTaxonomyHierarchical(termQuery.taxonomy) &&
			!termQuery.showNested
		) {
			parent = 0;
		}
	}

	const order = hasInclude ? 'ASC' : toOrderEnum(termQuery.order);
	const orderby = toTermOrderByEnum(termQuery.orderBy, hasInclude);

	const where: Record<string, unknown> = {
		taxonomies,
		hideEmpty: termQuery.hideEmpty !== false,
		order,
		orderby,
	};

	if (hasInclude) {
		where.include = includeIds;
	} else {
		if (typeof parent === 'number') where.parent = parent;
		if (typeof childOf === 'number') where.childOf = childOf;
	}

	const termsQuery = gql`
		query TermsQueryTerms(
			$first: Int!
			$where: RootQueryToTermNodeConnectionWhereArgs!
		) {
			terms(first: $first, where: $where) {
				nodes {
					id
					databaseId
					name
					slug
					uri
					count
					taxonomyName
				}
			}
		}
	`;

	const data = await fetcher(termsQuery, {
		variables: {
			first,
			where,
		},
	});

	return {
		data: {
			terms: {
				nodes: data?.terms?.nodes ?? [],
			},
		},
	};
};
