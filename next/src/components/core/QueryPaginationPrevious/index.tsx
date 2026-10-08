import Link from 'next/link';

export default function QueryPaginationPrevious(
	props: QueryPaginationPreviousProps
) {
	if (
		props.totalPages === undefined ||
		(typeof props.totalPages === 'number' && props.totalPages < 2)
	)
		return null;

	return (
		<div className="wp-block-query-pagination-previous">
			{props.href && (
				<Link href={props.href}>{props.label ?? 'Previous Page'}</Link>
			)}
			{!props.href && <span>{props.label ?? 'Previous Page'}</span>}
		</div>
	);
}
