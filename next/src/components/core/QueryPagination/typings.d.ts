interface QueryPaginationAttributes extends BlockAttributes {
	level: number;
	paginationArrow: 'arrow' | 'none';
	showLabel: boolean;
	children: React.ReactNode;
}

interface QueryPaginationProps extends QueryPaginationAttributes {}
