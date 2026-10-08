interface QueryPaginationNextAttributes extends BlockAttributes {
	children?: React.ReactNode;
	label?: string;
	href?: string | null;
	isDisabled?: boolean;
	/**
	 * Injected by the parent query; `null` when the total is unknown, absent
	 * when the loop doesn't paginate (it doesn't inherit the query).
	 */
	totalPages?: number | null;
}

type QueryPaginationNextProps = QueryPaginationNextAttributes;
