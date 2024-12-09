interface GraphQLMenuItemFields {
	id: string;
	parentId?: string;
	label: string;
	path: string;
	target: string;
	cssClasses: string;
}

interface NestedMenuItem extends Omit<GraphQLMenuItemFields, 'parentId'> {
	items: NestedMenuItem[];
}
