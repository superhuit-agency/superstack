import { gql } from '@/utils';

import block from './block.json';

// Export block slug for identification
export const slug = block.slug;

export const fragment = gql`
	fragment menuItemFragment on MenuItem {
		id
		parentId
		label
		path
		target
		cssClasses
	}
`;

/**
 * Make the flat menuItems array nested
 * as in WordPress
 *
 * @param menuNodes Initial nodes array
 * @returns Nested menu items
 */
export const formatter = (
	menuNodes: GraphQLMenuItemFields[]
): NestedMenuItem[] => {
	const parseItem = (item: GraphQLMenuItemFields): NestedMenuItem => ({
		...item,
		items: menuNodes
			.filter((i) => i.parentId === item.id)
			.map(({ parentId, ...node }) => parseItem(node)),
	});

	return menuNodes
		.filter(({ parentId }) => parentId === null) // only loop through 1st level nodes
		.map(({ parentId, ...item }) => parseItem(item));
};
