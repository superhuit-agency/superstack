interface ColumnAttributes {
	width?: string;
	verticalAlignment?: string;
}

interface ColumnProps
	extends React.HTMLProps<HTMLDivElement>, ColumnAttributes {}
