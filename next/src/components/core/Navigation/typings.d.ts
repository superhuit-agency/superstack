type SubmenuVisibility = 'hover' | 'click' | 'always';

type NavigationMenuItem = {
	id: string;
	databaseId: number;
	parentDatabaseId?: number | null;
	label?: string | null;
	url?: string | null;
	uri?: string | null;
	path?: string | null;
	target?: string | null;
	cssClasses?: Array<string | null> | null;
	order?: number | null;
};

interface NavigationAttributes extends BlockAttributes {
	ref?: number | null;
	attributesRef?: number | null;
	navigationMenuId?: number | null;
	__unstableLocation?: string;
	openSubmenusOnClick?: boolean;
	submenuVisibility?: SubmenuVisibility;
}

interface NavigationProps extends NavigationAttributes {
	children?: React.ReactNode;
	data?: {
		menuItems?: {
			nodes?: NavigationMenuItem[];
		};
	};
}
