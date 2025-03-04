interface GraphQLFooterFields {
	footer: { nodes: GraphQLMenuItemFields[] };
	legal: { nodes: GraphQLMenuItemFields[] };
	social: { nodes: GraphQLMenuItemFields[] };
	generalSettings: {
		title: string;
	};
}

interface FooterData {
	menus: {
		footer: { items: NestedMenuItem[] };
		legal: { items: NestedMenuItem[] };
		social: { items: NestedMenuItem[] };
	};
	siteTitle: string;
}

interface FooterProps extends FooterData {}
