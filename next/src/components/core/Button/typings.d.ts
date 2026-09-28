interface ButtonAttributes {
	text?: string;
	url?: HTMLAnchorElement['href'];
	linkTarget?: HTMLAnchorElement['target'];
	rel?: HTMLAnchorElement['rel'];
	className?: string;
	width?: number;
}

interface ButtonProps extends ButtonAttributes, LinkProps {
	variant?: 'fill' | 'outline' | 'link';
	onClick?: React.MouseEventHandler<HTMLAnchorElement>;
	download?: boolean;
}
