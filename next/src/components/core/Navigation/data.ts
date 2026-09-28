import { cacheTags } from '@/lib/cache-tags';
import { WordPressReadError } from '@/lib/wordpress-read-error';
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

// Returns `innerBlocks` so menu items are fetched fresh at request time
// instead of being baked into the cached FSE templates. See docs/fse-templating.md.
export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: NavigationAttributes | null = null
) => {
	const submenuVisibility = getSubmenuVisibility(attrs);

	if (typeof attrs?.ref !== 'number' || attrs.ref <= 0) {
		return { submenuVisibility, innerBlocks: [], cacheTags: [] };
	}

	const tags = [cacheTags.menu(attrs.ref)];

	const data = await fetcher(navigationMenuQuery, {
		variables: { id: String(attrs.ref) },
	});

	// `navigationMenu` is `null` when the menu doesn't exist, but missing
	// when the request failed: don't let a failure be cached as an empty menu.
	if (data?.navigationMenu === undefined) {
		throw new WordPressReadError(
			`the navigation menu ${attrs.ref}`,
			tags[0]
		);
	}

	try {
		const blocksJSON = data.navigationMenu?.blocksJSON;
		const innerBlocks: BlockPropsType[] = blocksJSON
			? JSON.parse(blocksJSON)
			: [];
		return { submenuVisibility, innerBlocks, cacheTags: tags };
	} catch {
		return { submenuVisibility, innerBlocks: [], cacheTags: tags };
	}
};
