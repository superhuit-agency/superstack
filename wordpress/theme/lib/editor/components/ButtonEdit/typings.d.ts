interface ButtonEditProps {
	attrs: ButtonProps;
	isSelected?: boolean;
	wrapperClass?: string;
	rootClass?: string;
	onChange: Function;
	linkSettings?: object;
	placeholder?: string;
	toolbarPosition?: 'left' | 'right';
	minCols?: number;
	maxCols?: number;
	inBlockControls?: boolean;
}
