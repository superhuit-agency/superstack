interface GraphQLMainNavFields {
	generalSettings: {
		title: string;
	};
	logo: GraphQLImageFields | null;
	header: { nodes: GraphQLMenuItemFields[] };

	node: null | {
		isFrontPage: boolean;
	};
}
interface MainNavData {
	isHome?: boolean;
	logo?: ImageProps | null;
	menus: {
		header: { items: NestedMenuItem[] };
	};
	siteTitle: string;
}

interface MainNavProps extends MainNavData {}
