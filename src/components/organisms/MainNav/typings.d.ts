interface GraphQLMainNavFields {
	generalSettings: {
		title: string;
	};
	logo: GraphQLImageFields | null;
	header: { nodes: GraphQLMenuItemFields[] };
}
interface MainNavData {
	logo?: ImageProps | null;
	menus?: {
		header: { items: NestedMenuItem[] };
	};
	siteTitle?: string;
}

interface MainNavProps extends MainNavData {}
