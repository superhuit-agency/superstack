interface LinkAttributes extends BlockAttributes {
	href: string;
	prefetch: boolean;
	scroll: boolean;
}

interface LinkProps extends LinkAttributes, BlockProps {}
