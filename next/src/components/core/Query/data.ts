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

const normalizeAuthorIn = (value?: string) => {
	const id = toPositiveInt(value);
	return typeof id === 'number' && id > 0 ? [id] : null;
};

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: QueryAttributes | null = null
) => {
	const queryPosts = gql`
		query QueryPosts(
			$first: Int!
			$offset: Int!
			$order: OrderEnum!
			$orderby: PostObjectsConnectionOrderbyEnum!
			$authorIn: [ID]
			$notIn: [ID]
			$search: String
		) {
			posts(
				first: $first
				where: {
					offsetPagination: { offset: $offset, size: $first }
					orderby: { field: $orderby, order: $order }
					authorIn: $authorIn
					notIn: $notIn
					search: $search
					stati: PUBLISH
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
					title(format: RENDERED)
					excerpt(format: RENDERED)
					content(format: RENDERED)
					author {
						node {
							name
						}
					}
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

	const queryPages = gql`
		query QueryPages(
			$first: Int!
			$offset: Int!
			$order: OrderEnum!
			$orderby: PostObjectsConnectionOrderbyEnum!
			$authorIn: [ID]
			$notIn: [ID]
			$search: String
		) {
			pages(
				first: $first
				where: {
					offsetPagination: { offset: $offset, size: $first }
					orderby: { field: $orderby, order: $order }
					authorIn: $authorIn
					notIn: $notIn
					search: $search
					stati: PUBLISH
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
					title(format: RENDERED)
					content(format: RENDERED)
					author {
						node {
							name
						}
					}
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

	const perPageRaw = attrs?.query?.perPage;
	const perPage = Math.min(100, Math.max(1, toPositiveInt(perPageRaw) ?? 10));

	const offsetRaw = attrs?.query?.offset;
	const baseOffset = Math.max(0, toPositiveInt(offsetRaw) ?? 0);

	const order = toOrderEnum(attrs?.query?.order);
	const orderby = toOrderByEnum(attrs?.query?.orderBy);

	const search =
		typeof attrs?.query?.search === 'string' && attrs.query.search.trim()
			? attrs.query.search.trim()
			: null;

	const authorIn = normalizeAuthorIn(attrs?.query?.author);
	const notIn = normalizeIdList(attrs?.query?.exclude);

	const postType = attrs?.query?.postType?.toLowerCase();

	const offset = baseOffset;

	const variables = {
		first: perPage,
		offset,
		order,
		orderby,
		authorIn,
		notIn,
		search,
	};

	if (postType === 'page' || postType === 'pages') {
		const data = await fetcher(queryPages, { variables });
		const total =
			typeof data?.pages?.pageInfo?.offsetPagination?.total === 'number'
				? data.pages.pageInfo.offsetPagination.total
				: null;
		const totalPages =
			typeof total === 'number' && total >= 0
				? Math.ceil(total / perPage)
				: null;
		const currentPage = Math.floor(offset / perPage) + 1;

		const nodes = (data?.pages?.nodes ?? []).map((node: unknown) => ({
			...(node as Record<string, unknown>),
			excerpt: '',
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
	}

	const data = await fetcher(queryPosts, { variables });
	const total =
		typeof data?.posts?.pageInfo?.offsetPagination?.total === 'number'
			? data.posts.pageInfo.offsetPagination.total
			: null;
	const totalPages =
		typeof total === 'number' && total >= 0
			? Math.ceil(total / perPage)
			: null;
	const currentPage = Math.floor(offset / perPage) + 1;
	return {
		data: {
			posts: {
				nodes: data?.posts?.nodes ?? [],
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
