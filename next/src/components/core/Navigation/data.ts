import { gql } from '@/utils';

const getSubmenuVisibility = (attrs: NavigationAttributes | null) => {
	const deprecatedOpenOnClick = attrs?.openSubmenusOnClick;
	if (deprecatedOpenOnClick !== null && deprecatedOpenOnClick !== undefined) {
		return deprecatedOpenOnClick ? 'click' : 'hover';
	}

	return attrs?.submenuVisibility ?? 'hover';
};

const toNormalizedRef = (attrs: NavigationAttributes | null) => {
	if (typeof attrs?.attributesRef === 'number' && attrs.attributesRef > 0)
		return attrs.attributesRef;
	if (
		typeof attrs?.navigationMenuId === 'number' &&
		attrs.navigationMenuId > 0
	) {
		return attrs.navigationMenuId;
	}
	return null;
};

const toNormalizedLocation = (attrs: NavigationAttributes | null) => {
	const location = attrs?.__unstableLocation;
	if (typeof location !== 'string' || !location.trim()) return null;
	return location;
};

const navigationBlocksQuery = gql`
	query NavigationBlocksJSON($ref: Int!) {
		navigationBlocksJSON(ref: $ref)
	}
`;

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: NavigationAttributes | null = null
) => {
	const submenuVisibility = getSubmenuVisibility(attrs);

	// Block-based navigation: fetch fresh innerBlocks from the wp_navigation post.
	if (typeof attrs?.ref === 'number' && attrs.ref > 0) {
		try {
			const data = await fetcher(navigationBlocksQuery, {
				variables: { ref: attrs.ref },
			});
			const blocksJSON = data?.navigationBlocksJSON;
			const innerBlocks: BlockPropsType[] = blocksJSON
				? JSON.parse(blocksJSON)
				: [];
			return { submenuVisibility, innerBlocks };
		} catch {
			return { submenuVisibility, innerBlocks: [] };
		}
	}

	const ref = toNormalizedRef(attrs);
	const location = toNormalizedLocation(attrs);

	const query = gql`
		query NavigationMenuItems($id: Int, $location: MenuLocationEnum) {
			menuItems(first: 200, where: { id: $id, location: $location }) {
				nodes {
					id
					databaseId
					parentDatabaseId
					label
					url
					uri
					path
					target
					cssClasses
					order
				}
			}
		}
	`;

	// Fallback safety: no query-relevant selector => don't call API.
	if (!ref && !location) {
		return {
			ref: attrs?.ref ?? null,
			submenuVisibility,
			data: { menuItems: { nodes: [] } },
		};
	}

	try {
		const data = await fetcher(query, {
			variables: {
				id: ref,
				location,
			},
		});

		return {
			ref: ref ?? attrs?.ref ?? null,
			submenuVisibility,
			data: {
				menuItems: {
					nodes: data?.menuItems?.nodes ?? [],
				},
			},
		};
	} catch (error) {
		return {
			ref: ref ?? attrs?.ref ?? null,
			submenuVisibility,
			data: { menuItems: { nodes: [] } },
		};
	}
};
