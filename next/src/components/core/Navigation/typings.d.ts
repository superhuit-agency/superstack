type SubmenuVisibility = 'hover' | 'click' | 'always';

interface NavigationAttributes extends BlockAttributes {
	ref?: number | null;
	openSubmenusOnClick?: boolean;
	submenuVisibility?: SubmenuVisibility;
}

interface NavigationProps extends NavigationAttributes {
	children?: React.ReactNode;
}
