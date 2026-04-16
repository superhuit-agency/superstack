import Link from 'next/link';

export default function QueryPaginationNext(props: QueryPaginationNextProps) {
  return (
    <div className="wp-block-query-pagination-next">
      {props.href && (
        <Link href={props.href}>{props.label ?? 'Next Page'}</Link>
      )}
      {!props.href && <span>{props.label ?? 'Next Page'}</span>}
    </div>
  );
}
