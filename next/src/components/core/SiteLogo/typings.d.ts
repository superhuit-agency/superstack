interface SiteLogoAttributes extends BlockAttributes {
	url?: string;
	alt?: string;
	width?: number;
	height?: number;
	isLink?: boolean;
	linkTarget?: string;
}

interface SiteLogoProps extends SiteLogoAttributes {
	children?: React.ReactNode;
}
