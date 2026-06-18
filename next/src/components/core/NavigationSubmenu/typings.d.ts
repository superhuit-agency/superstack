interface NavigationSubmenuAttributes extends BlockAttributes {
	children: React.ReactNode;
	label: string;
	url: string;
}

interface NavigationSubmenuProps extends NavigationSubmenuAttributes {}
