import './styles.css';

export default function TermsQuery(props: TermsQueryProps) {
	const nodes = props.data?.terms?.nodes ?? [];
	const hasTerms = nodes.length > 0;

	return (
		<div className="wp-block-terms-query">
			{hasTerms && (
				<ul className="wp-block-terms-query__list">
					{nodes.map((term) => (
						<li
							key={term.id}
							className={`wp-block-term term-${term.databaseId}${term.taxonomyName ? ` taxonomy-${term.taxonomyName.replace(/[^\w-]/g, '')}` : ''}`}
						>
							{term.uri ? (
								<a href={term.uri}>
									{term.name}
									{term.count ? ` (${term.count})` : ''}
								</a>
							) : (
								<span>
									{term.name}
									{term.count ? ` (${term.count})` : ''}
								</span>
							)}
						</li>
					))}
				</ul>
			)}
			{props.children}
		</div>
	);
}
