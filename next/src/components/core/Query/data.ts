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

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: QueryAttributes | null = null,
	lang: string | null = null
) => {
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

	const postType = attrs?.query?.postType;
	const contentTypes = postType ? [postType.toUpperCase()] : null;

	const variables = {
		first: perPage,
		offset,
		order,
		orderby,
		notIn,
		search,
		contentTypes,
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
	const currentPage = Math.floor(offset / perPage) + 1;

	const nodes = (data?.contentNodes?.nodes ?? []).map((node: unknown) => ({
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
	};
};
