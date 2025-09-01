interface ButtonAttributes extends BlockAttributes {
	variant?: 'primary' | 'secondary' | 'link';
	text?: string;
	url?: HTMLAnchorElement['href'];
	linkTarget?: HTMLAnchorElement['target'];
	rel?: HTMLAnchorElement['rel'];
}

interface ButtonProps extends ButtonAttributes, LinkProps {}
