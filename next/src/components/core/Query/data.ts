import configs from '@/configs.json';
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

const queryContentNodes = gql`
  query QueryContentNodes(
    $first: Int!
    $offset: Int!
    $order: OrderEnum!
    $orderby: PostObjectsConnectionOrderbyEnum!
    $notIn: [ID]
    $search: String
    $contentTypes: [ContentTypeEnum]
    $categoryIn: [ID]
    $tagIn: [ID]
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

	return { href, label, isDisabled: !enabled };
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

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: QueryAttributes | null = null,
	lang: string | null = null,
	context: BlockDataContext = {}
) => {
	const perPageRaw = attrs?.query?.perPage;
	const perPage = Math.min(100, Math.max(1, toPositiveInt(perPageRaw) ?? 10));

	const page = context?.page && context.page > 0 ? context.page : 1;
	const offset = (page - 1) * perPage;

	const order = toOrderEnum(attrs?.query?.order);
	const orderby = toOrderByEnum(attrs?.query?.orderBy);

	const search =
		typeof attrs?.query?.search === 'string' && attrs.query.search.trim()
			? attrs.query.search.trim()
			: null;

	const notIn = normalizeIdList(attrs?.query?.exclude);

	const postType = attrs?.query?.postType;
	const contentTypes = postType ? [postType.toUpperCase()] : null;

	// Scope the loop to the current term archive (Tag/Category page) when one is
	// in context, so the query returns only that term's posts.
	const term = context?.term ?? null;
	const categoryIn = term?.taxonomy === 'category' ? [term.databaseId] : null;
	const tagIn = term?.taxonomy === 'tag' ? [term.databaseId] : null;

	const variables = {
		first: perPage,
		offset,
		order,
		orderby,
		notIn,
		search,
		contentTypes,
		categoryIn,
		tagIn,
		...(configs.isMultilang
			? { language: lang ? lang.toUpperCase() : 'ALL' }
			: {}),
	};

	const data = await fetcher(queryContentNodes, { variables });

	const total =
		typeof data?.contentNodes?.pageInfo?.offsetPagination?.total ===
		'number'
			? data.contentNodes.pageInfo.offsetPagination.total
			: null;
	const totalPages =
		typeof total === 'number' && total >= 0
			? Math.ceil(total / perPage)
			: null;
	const currentPage = page;

	const nodes = (data?.contentNodes?.nodes ?? []).map((node: unknown) => ({
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
	};
};
