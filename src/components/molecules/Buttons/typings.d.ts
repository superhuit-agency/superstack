interface ButtonsProps extends React.HTMLProps<HTMLDivElement> {
	layout?: {
		flexWrap?: 'wrap' | 'nowrap';
		justifyContent?:
			| 'center'
			| 'flex-start'
			| 'flex-end'
			| 'space-between'
			| 'space-around'
			| 'space-evenly';
		orientation?: 'horizontal' | 'vertical';
		type?: 'flex' | 'grid';
		verticalAlignment?: 'top' | 'center' | 'bottom';
	};
}
