import Link from 'next/link';

/**
 * Mirrors WordPress `paginate_links()` `end_size` (how many pages are always
 * shown at the very start and end of the list).
 */
const END_SIZE = 1;

const buildHref = (baseUri: string, page: number) => {
	if (page <= 1) return baseUri;
	const base = baseUri.endsWith('/') ? baseUri : `${baseUri}/`;
	return `${base}page/${page}/`;
};

/**
 * Numbered pagination for a `core/query` loop. `currentPage`, `totalPages` and
 * `baseUri` are injected at request time by the parent query's data layer (see
 * `core/Query/data.ts`), matching the next/previous blocks. Rendering replicates
 * `paginate_links()` with `prev_next` disabled:
 * the first/last `END_SIZE` pages plus a `midSize` window around the current
 * page are shown, and skipped ranges collapse into `…` dots.
 */
export default function QueryPaginationNumbers({
	midSize = 2,
	currentPage,
	totalPages,
	baseUri = '/',
}: QueryPaginationNumbersProps) {
	if (!currentPage || !totalPages || totalPages < 2) return null;

	const elements: React.ReactNode[] = [];
	let dots = false;

	for (let page = 1; page <= totalPages; page++) {
		if (page === currentPage) {
			elements.push(
				<span
					key={page}
					aria-current="page"
					className="page-numbers current"
				>
					{page}
				</span>
			);
			dots = true;
		} else if (
			page <= END_SIZE ||
			(page >= currentPage - midSize && page <= currentPage + midSize) ||
			page > totalPages - END_SIZE
		) {
			elements.push(
				<Link
					key={page}
					className="page-numbers"
					href={buildHref(baseUri, page)}
				>
					{page}
				</Link>
			);
			dots = true;
		} else if (dots) {
			elements.push(
				<span key={`dots-${page}`} className="page-numbers dots">
					…
				</span>
			);
			dots = false;
		}
	}

	return <div className="wp-block-query-pagination-numbers">{elements}</div>;
}
