interface QueryPaginationNextAttributes extends BlockAttributes {
	children?: React.ReactNode;
	label?: string;
	href?: string | null;
	isDisabled?: boolean;
	/** Injected by the parent query; `null` when the total is unknown. */
	totalPages?: number | null;
}

type QueryPaginationNextProps = QueryPaginationNextAttributes;
