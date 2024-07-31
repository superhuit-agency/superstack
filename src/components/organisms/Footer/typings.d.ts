interface FooterDataType {
	siteTitle: string;
	menus: {
		footer: { items: MenuItemType[] };
		legal: { items: MenuItemType[] };
		social: { items: MenuItemType[] };
	};
}

interface FooterProps extends FooterDataType {
	isHome?: boolean;
}
