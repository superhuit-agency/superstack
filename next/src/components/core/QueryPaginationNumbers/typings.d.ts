interface QueryPaginationNumbersAttributes extends BlockAttributes {
	midSize?: number;
}

interface QueryPaginationNumbersProps extends QueryPaginationNumbersAttributes {
	/** Injected at request time by the parent `core/query` data layer. */
	currentPage?: number;
	/** Injected by the parent query; `null`/undefined when the total is unknown. */
	totalPages?: number | null;
	/** Base uri of the paginated node (e.g. `/blog/`), injected by the parent query. */
	baseUri?: string;
}
