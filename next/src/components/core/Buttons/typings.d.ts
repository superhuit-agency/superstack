interface ButtonsProps extends React.HTMLProps<HTMLDivElement> {
	layout?: {
		justifyContent?: 'center' | 'left' | 'right' | 'space-between';
		orientation?: 'horizontal' | 'vertical';
	};
}
