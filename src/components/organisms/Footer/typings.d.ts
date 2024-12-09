interface GraphQLFooterFields {
	footer: { nodes: GraphQLMenuItemFields[] };
	legal: { nodes: GraphQLMenuItemFields[] };
	social: { nodes: GraphQLMenuItemFields[] };
	generalSettings: {
		title: string;
	};
	node: null | {
		isFrontPage: boolean;
	};
}

interface FooterData {
	isHome: boolean;
	menus: {
		footer: { items: NestedMenuItem[] };
		legal: { items: NestedMenuItem[] };
		social: { items: NestedMenuItem[] };
	};
	siteTitle: string;
}

interface FooterProps extends FooterData {}
