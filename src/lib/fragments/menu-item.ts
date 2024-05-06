import { gql } from '@/utils';

export const menuItemFragment = gql`
	fragment menuItemFragment on MenuItem {
		id
		parentId
		label
		path
		target
		cssClasses
	}
`;

export interface MenuItem {
	id: string;
	parentId?: string;
	label: string;
	path: string;
	target: string;
	cssClasses: string;
}
