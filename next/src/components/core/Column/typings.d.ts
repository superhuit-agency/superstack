interface ColumnAttributes extends BlockAttributes {
	width?: string;
	verticalAlignment?: string;
	templateLock?: 'all' | 'insert' | 'contentOnly' | false;
}

interface ColumnProps
	extends React.HTMLProps<HTMLDivElement>, ColumnAttributes {}
