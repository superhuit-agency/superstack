interface ColumnAttributes {
	width?: string;
}

interface ColumnProps
	extends React.HTMLProps<HTMLDivElement>, ColumnAttributes {}
