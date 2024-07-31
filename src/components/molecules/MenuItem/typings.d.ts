interface GraphQLMenuItemFields {
	id: string;
	parentId?: string;
	label: string;
	path: string;
	target: string;
	cssClasses: string;
}

interface MenuItem extends Omit<GraphQLMenuItemFields, 'parentId'> {
	id?: string;
	target?: string;
	cssClasses?: string;
}

interface NestedMenuItem extends MenuItem {
	items?: NestedMenuItem[];
}
