interface ButtonAttributes extends BlockAttributes, LinkAttributes {
	variant?: 'primary' | 'secondary' | 'link';
}

interface ButtonProps extends ButtonAttributes, LinkProps {}
