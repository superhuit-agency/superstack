import { Fragment } from 'react/jsx-runtime';

export default function PostTerms(props: PostTermsProps) {
	if (
		(!props.categories || props.categories.length === 0) &&
		(!props.tags || props.tags.length === 0)
	)
		return null;

	const terms = [...(props.categories || []), ...(props.tags || [])];
	return (
		<div className="wp-block-post-terms">
			{props.prefix && (
				<span className="wp-block-post-terms__prefix">
					{props.prefix}
				</span>
			)}
			{terms.map((term, index) => (
				<Fragment key={term.name}>
					<a href={term.uri} rel="tag">
						{term.name}
					</a>
					{index < terms.length - 1 && (
						<span className="wp-block-post-terms__separator">
							{props.separator}
						</span>
					)}
				</Fragment>
			))}
			{props.suffix && (
				<span className="wp-block-post-terms__suffix">
					{props.suffix}
				</span>
			)}
		</div>
	);
}
