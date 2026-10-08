import configs from '@/configs.json';
import { cacheTags } from '@/lib/cache-tags';
import { gql } from '@/utils';

const ORDER_ENUMS = new Set(['ASC', 'DESC']);
const ORDER_BY_ENUMS = new Set([
	'AUTHOR',
	'COMMENT_COUNT',
	'DATE',
	'IN',
	'MENU_ORDER',
	'MODIFIED',
	'NAME_IN',
	'PARENT',
	'SLUG',
	'TITLE',
]);

const toOrderEnum = (value?: string) => {
	const normalized = value?.toUpperCase();
	return normalized && ORDER_ENUMS.has(normalized) ? normalized : 'DESC';
};

const toOrderByEnum = (value?: string) => {
	const normalized = value?.toUpperCase();
	return normalized && ORDER_BY_ENUMS.has(normalized) ? normalized : 'DATE';
};

const toPositiveInt = (value: unknown) => {
	if (typeof value === 'number' && Number.isFinite(value))
		return Math.trunc(value);
	if (typeof value === 'string' && value.trim()) {
		const parsed = Number.parseInt(value, 10);
		return Number.isNaN(parsed) ? null : parsed;
	}
	return null;
};

const normalizeIdList = (value?: Array<string> | string[]) => {
	if (!Array.isArray(value)) return null;
	const ids = value
		.map((v) => toPositiveInt(v))
		.filter((id): id is number => typeof id === 'number' && id > 0);
	return ids.length ? ids : null;
};

const nodeFields = `
        id
        databaseId
        uri
        date
        ... on NodeWithTitle {
          title(format: RENDERED)
        }
        ... on NodeWithExcerpt {
          excerpt(format: RENDERED)
        }
        ... on NodeWithContentEditor {
          content(format: RENDERED)
        }
        ... on NodeWithAuthor {
          author {
            node {
              name
            }
          }
        }
        ... on NodeWithFeaturedImage {
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

const queryPosts = gql`
  query QueryPosts(
    $first: Int!
    $offset: Int!
    $order: OrderEnum!
    $orderby: PostObjectsConnectionOrderbyEnum!
    $notIn: [ID]
    $search: String
    $categoryId: Int
    $categoryIn: [ID]
    $tagIn: [ID]
    ${configs.isMultilang ? '$language: LanguageCodeFilterEnum' : ''}
  ) {
    posts(
      first: $first
      where: {
        offsetPagination: { offset: $offset, size: $first }
        orderby: { field: $orderby, order: $order }
        notIn: $notIn
        search: $search
        stati: PUBLISH
        categoryId: $categoryId
        categoryIn: $categoryIn
        tagIn: $tagIn
        ${configs.isMultilang ? 'language: $language' : ''}
      }
    ) {
      pageInfo {
        offsetPagination {
          total
        }
      }
      nodes {
        ${nodeFields}
      }
    }
  }
`;

const queryContentNodes = gql`
  query QueryContentNodes(
    $first: Int!
    $offset: Int!
    $order: OrderEnum!
    $orderby: PostObjectsConnectionOrderbyEnum!
    $notIn: [ID]
    $search: String
    $contentTypes: [ContentTypeEnum]
    $taxTermIn: [ID]
    ${configs.isMultilang ? '$language: LanguageCodeFilterEnum' : ''}
  ) {
    contentNodes(
      first: $first
      where: {
        offsetPagination: { offset: $offset, size: $first }
        orderby: { field: $orderby, order: $order }
        notIn: $notIn
        search: $search
        stati: PUBLISH
        contentTypes: $contentTypes
        taxTermIn: $taxTermIn
        ${configs.isMultilang ? 'language: $language' : ''}
      }
    ) {
      pageInfo {
        offsetPagination {
          total
        }
      }
      nodes {
        ${nodeFields}
      }
    }
  }
`;

const PAGINATION_BLOCKS = new Set([
	'core/query-pagination-next',
	'core/query-pagination-previous',
	'core/query-pagination-numbers',
]);

const buildPageHref = (baseUri: string, page: number) => {
	if (page <= 1) return baseUri;
	const base = baseUri.endsWith('/') ? baseUri : `${baseUri}/`;
	return `${base}page/${page}/`;
};

/**
 * Compute the request-time attributes for a single pagination child block,
 * mirroring what WordPress core injects when it server-renders these blocks.
 */
const paginationChildAttrs = (
	name: string,
	attrs: Record<string, unknown>,
	currentPage: number,
	totalPages: number | null,
	baseUri: string
): Record<string, unknown> => {
	if (name === 'core/query-pagination-numbers') {
		return { currentPage, totalPages, baseUri };
	}

	const isNext = name === 'core/query-pagination-next';
	const rawLabel = typeof attrs.label === 'string' ? attrs.label.trim() : '';
	const label = rawLabel || (isNext ? 'Next Page' : 'Previous Page');

	let href: string | null = null;
	let enabled = false;

	if (isNext) {
		const canGoNext = totalPages === null ? true : currentPage < totalPages;
		if (canGoNext) {
			href = buildPageHref(baseUri, currentPage + 1);
			enabled = true;
		}
	} else if (currentPage > 1) {
		href = buildPageHref(baseUri, currentPage - 1);
		enabled = true;
	}

	return { href, label, isDisabled: !enabled, totalPages };
};

/**
 * Walk this query's `innerBlocks` and inject the resolved pagination state into
 * its pagination children, so they stay in sync at request time (no rebuild
 * needed when posts are added). Nested `core/query` loops are left untouched —
 * each resolves its own pagination.
 */
const injectPagination = (
	blocks: BlockPropsType[],
	currentPage: number,
	totalPages: number | null,
	baseUri: string
): BlockPropsType[] =>
	blocks.map((block) => {
		if (block.name === 'core/query') return block;

		if (PAGINATION_BLOCKS.has(block.name)) {
			return {
				...block,
				attributes: {
					...block.attributes,
					...paginationChildAttrs(
						block.name,
						block.attributes,
						currentPage,
						totalPages,
						baseUri
					),
				},
			};
		}

		return {
			...block,
			innerBlocks: injectPagination(
				block.innerBlocks ?? [],
				currentPage,
				totalPages,
				baseUri
			),
		};
	});

/**
 * A loop inheriting the template query lists the archive being viewed, and
 * follows the `/page/{n}` route.
 */
export const usesArchiveContext = (attrs: Pick<QueryAttributes, 'query'>) =>
	attrs?.query?.inherit === true;

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: QueryAttributes | null = null,
	lang: string | null = null,
	context: BlockDataContext = {}
) => {
	// `inherit: true` means "take your parameters from the WordPress main
	// query", so everything standing in for that main query — post type,
	// current term, current page — is gated on it.
	const inherit = attrs?.query?.inherit === true;

	const perPageRaw = attrs?.query?.perPage;
	const perPage = Math.min(100, Math.max(1, toPositiveInt(perPageRaw) ?? 10));

	// Only the loop inheriting the main query follows the `/page/{n}` route; a
	// custom loop paginates on its own `queryId` in WordPress, which this
	// implementation does not read, so it stays on its first page.
	const page =
		inherit && context?.page && context.page > 0 ? context.page : 1;

	const offsetRaw = attrs?.query?.offset;
	const blockOffset = Math.max(0, toPositiveInt(offsetRaw) ?? 0);
	const offset = blockOffset + (page - 1) * perPage;

	const order = toOrderEnum(attrs?.query?.order);
	const orderby = toOrderByEnum(attrs?.query?.orderBy);

	const search =
		typeof attrs?.query?.search === 'string' && attrs.query.search.trim()
			? attrs.query.search.trim()
			: null;

	const notIn = normalizeIdList(attrs?.query?.exclude);

	// In "default" query mode (`inherit: true`) WordPress never persists the post
	// type — it leaves `query.postType` at the block default ("post") and resolves
	// the type from the template's main query at render time. Mirror that here by
	// reading the post type archive in context.
	const postType = inherit
		? (context?.archive?.postType ?? 'post')
		: (attrs?.query?.postType ?? 'post');

	// An inheriting loop lists the current term archive (Tag/Category page)
	// when one is in context, and ignores the block's own taxonomy filters, as
	// WordPress does. A custom loop keeps its own taxonomy filters instead: it
	// is not the archive listing, even when it sits on an archive page.
	const term = inherit ? (context?.term ?? null) : null;
	// `categoryId` maps to WP_Query's `cat`, which, like a category archive,
	// includes the child categories' posts.
	const categoryId = term?.taxonomy === 'category' ? term.databaseId : null;
	const termTagIn = term?.taxonomy === 'tag' ? [term.databaseId] : null;
	// Custom taxonomies have no dedicated where arg in WPGraphQL: they go
	// through the theme's `taxTermIn` filter on the content node connection.
	const taxTermIn =
		term && !categoryId && !termTagIn ? [term.databaseId] : null;

	const categoryIn = inherit
		? null
		: normalizeIdList(
				attrs?.query?.taxQuery?.category as Array<string> | undefined
			);
	const tagIn = inherit
		? termTagIn
		: normalizeIdList(
				attrs?.query?.taxQuery?.post_tag as Array<string> | undefined
			);

	const usePostsQuery = postType === 'post' && !taxTermIn;

	const variables: Record<string, unknown> = {
		first: perPage,
		offset,
		order,
		orderby,
		notIn,
		search,
		...(configs.isMultilang
			? { language: lang ? lang.toUpperCase() : 'ALL' }
			: {}),
	};
	if (usePostsQuery) {
		variables.categoryId = categoryId;
		variables.categoryIn = categoryIn;
		variables.tagIn = tagIn;
	} else {
		variables.contentTypes = [postType.toUpperCase()];
		variables.taxTermIn = taxTermIn;
	}

	const data = await fetcher(usePostsQuery ? queryPosts : queryContentNodes, {
		variables,
	});

	const connection = usePostsQuery ? data?.posts : data?.contentNodes;
	const total =
		typeof connection?.pageInfo?.offsetPagination?.total === 'number'
			? connection.pageInfo.offsetPagination.total
			: null;
	// `total` counts the posts the block's offset skips: past them, the last
	// pages would be empty
	const totalPages =
		typeof total === 'number' && total >= 0
			? Math.ceil(Math.max(0, total - blockOffset) / perPage)
			: null;
	const currentPage = page;

	const nodes = (connection?.nodes ?? []).map((node: unknown) => ({
		excerpt: '',
		content: null,
		author: null,
		featuredImage: null,
		...(node as Record<string, unknown>),
	}));

	const baseUri = context?.baseUri ?? '/';
	const innerBlocks = Array.isArray(context?.innerBlocks)
		? injectPagination(
				context.innerBlocks,
				currentPage,
				totalPages,
				baseUri
			)
		: undefined;

	return {
		data: {
			posts: {
				nodes,
			},
		},
		pagination: {
			perPage,
			offset,
			currentPage,
			total,
			totalPages,
		},
		...(innerBlocks !== undefined ? { innerBlocks } : {}),
		cacheTags: [cacheTags.type(postType)],
	};
};
