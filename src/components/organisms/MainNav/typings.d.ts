interface MainNavProps {
	menus: {
		header: { items: MenuItemType[] };
	};
	siteTitle: string;
	logo?: Omit<ImageProps, 'alt'> & { alt?: string };
}
