import Link from 'next/link';

export default function QueryPaginationNext(props: QueryPaginationNextProps) {
	if (
		props.totalPages === undefined ||
		(typeof props.totalPages === 'number' && props.totalPages < 2)
	)
		return null;

	return (
		<div className="wp-block-query-pagination-next">
			{props.href && (
				<Link href={props.href}>{props.label ?? 'Next Page'}</Link>
			)}
			{!props.href && <span>{props.label ?? 'Next Page'}</span>}
		</div>
	);
}
