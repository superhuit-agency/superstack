import { MenuItem } from './fragments';

export interface NestedMenuItem extends Omit<MenuItem, 'parentId'> {
	items: NestedMenuItem[];
}

/**
 * Make the flat menuItems array nested
 * as in WordPress
 *
 * @param menuNodes Initial nodes array
 * @returns Nested menu items
 */
export default function formatMenuItems(menuNodes: MenuItem[]) {
	const parseItem = (item: MenuItem): NestedMenuItem => {
		return {
			...item,
			items: menuNodes
				.filter((i) => i.parentId === item.id)
				.map(({ parentId, ...node }) => parseItem(node)),
		};
	};

	return menuNodes
		.filter(({ parentId }) => parentId === null) // only loop through 1st level nodes
		.map(({ parentId, ...item }) => parseItem(item));
}
