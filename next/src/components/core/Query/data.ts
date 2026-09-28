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

/** A loop inheriting the template query lists the archive being viewed. */
export const usesArchiveContext = true;

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: QueryAttributes | null = null,
	lang: string | null = null,
	context: BlockDataContext = {}
) => {
	// `inherit: true` means "take your parameters from the WordPress main
	// query", so everything standing in for that main query — post type and
	// current term — is gated on it.
	const inherit = attrs?.query?.inherit === true;

	const perPageRaw = attrs?.query?.perPage;
	const perPage = Math.min(100, Math.max(1, toPositiveInt(perPageRaw) ?? 10));

	const offsetRaw = attrs?.query?.offset;
	const offset = Math.max(0, toPositiveInt(offsetRaw) ?? 0);

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

	// Scope the loop to the current term archive (Tag/Category page) when one is
	// in context, on top of any taxonomy filters set on the block itself. A
	// custom loop keeps its own taxonomy filters instead: it is not the archive
	// listing, even when it sits on an archive page.
	const term = inherit ? (context?.term ?? null) : null;
	const termCategoryId =
		term?.taxonomy === 'category' ? term.databaseId : null;
	const tagIn = term?.taxonomy === 'tag' ? [term.databaseId] : null;
	// Custom taxonomies have no dedicated where arg in WPGraphQL: they go
	// through the theme's `taxTermIn` filter on the content node connection.
	const taxTermIn =
		term && !termCategoryId && !tagIn ? [term.databaseId] : null;

	const attrCategoryIn =
		normalizeIdList(
			attrs?.query?.taxQuery?.category as Array<string> | undefined
		) ?? [];
	const mergedCategoryIn = [
		...attrCategoryIn,
		...(termCategoryId ? [termCategoryId] : []),
	];
	const categoryIn = mergedCategoryIn.length ? mergedCategoryIn : null;

	const usePostsQuery = postType === 'post';

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
	const totalPages =
		typeof total === 'number' && total >= 0
			? Math.ceil(total / perPage)
			: null;
	const currentPage = Math.floor(offset / perPage) + 1;

	const nodes = (connection?.nodes ?? []).map((node: unknown) => ({
		excerpt: '',
		content: null,
		author: null,
		featuredImage: null,
		...(node as Record<string, unknown>),
	}));

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
		cacheTags: [cacheTags.type(postType)],
	};
};
