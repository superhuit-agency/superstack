import { gql } from '@/utils';

const getSubmenuVisibility = (attrs: NavigationAttributes | null) => {
	const deprecatedOpenOnClick = attrs?.openSubmenusOnClick;
	if (deprecatedOpenOnClick !== null && deprecatedOpenOnClick !== undefined) {
		return deprecatedOpenOnClick ? 'click' : 'hover';
	}

	return attrs?.submenuVisibility ?? 'hover';
};

const navigationMenuQuery = gql`
	query NavigationMenuBlocks($id: ID!) {
		navigationMenu(id: $id, idType: DATABASE_ID) {
			blocksJSON
		}
	}
`;

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: NavigationAttributes | null = null
) => {
	const submenuVisibility = getSubmenuVisibility(attrs);

	if (typeof attrs?.ref !== 'number' || attrs.ref <= 0) {
		return { submenuVisibility, innerBlocks: [] };
	}

	try {
		const data = await fetcher(navigationMenuQuery, {
			variables: { id: String(attrs.ref) },
		});
		const blocksJSON = data?.navigationMenu?.blocksJSON;
		const innerBlocks: BlockPropsType[] = blocksJSON
			? JSON.parse(blocksJSON)
			: [];
		return { submenuVisibility, innerBlocks };
	} catch {
		return { submenuVisibility, innerBlocks: [] };
	}
};
