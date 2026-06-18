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

const normalizeCategoryIds = (
	categories?: LatestPostAttributes['categories']
) => {
	if (!categories) return null;

	if (typeof categories === 'string') {
		const id = Number.parseInt(categories, 10);
		return Number.isNaN(id) ? null : [id];
	}

	if (!Array.isArray(categories)) return null;

	const ids = categories
		.map((category) => Number(category?.id))
		.filter((id) => Number.isFinite(id) && id > 0);

	return ids.length ? ids : null;
};

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: LatestPostAttributes | null = null
) => {
	const query = gql`
		query LatestPosts(
			$first: Int!
			$order: OrderEnum!
			$orderby: PostObjectsConnectionOrderbyEnum!
			$authorIn: [ID]
			$categoryIn: [ID]
		) {
			posts(
				first: $first
				where: {
					orderby: { field: $orderby, order: $order }
					authorIn: $authorIn
					categoryIn: $categoryIn
					stati: PUBLISH
				}
			) {
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

	const first = Math.max(1, attrs?.postsToShow ?? 5);
	const order = toOrderEnum(attrs?.order);
	const orderby = toOrderByEnum(attrs?.orderBy);

	const selectedAuthor =
		typeof attrs?.selectedAuthor === 'number' && attrs.selectedAuthor > 0
			? [attrs.selectedAuthor]
			: null;
	const categories = normalizeCategoryIds(attrs?.categories);

	const data = await fetcher(query, {
		variables: {
			first,
			order,
			orderby,
			authorIn: selectedAuthor,
			categoryIn: categories,
		},
	});

	return { data };
};
