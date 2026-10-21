interface NavigationLinkAttributes extends BlockAttributes {
	url: string;
	label: string;
}

interface NavigationLinkProps extends NavigationLinkAttributes {
	as?: 'li' | 'div';
	'aria-haspopup'?: 'true' | 'false';
	'aria-expanded'?: 'true' | 'false';
	'aria-controls'?: string;
	'aria-label'?: string;
	'aria-labelledby'?: string;
	'aria-describedby'?: string;
	'aria-roledescription'?: string;
	'aria-describedby'?: string;
	role?: string;
	id?: string;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
}
