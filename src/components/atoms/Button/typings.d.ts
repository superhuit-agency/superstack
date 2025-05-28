interface ButtonAttributes extends BlockAttributes, LinkProps {
	variant?: 'primary' | 'secondary' | 'link';
}

interface ButtonProps extends ButtonAttributes, LinkProps {}
