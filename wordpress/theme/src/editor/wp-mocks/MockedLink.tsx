// WP Editor doesn't support next/link, so we need to return a regular anchor tag
const MockedLink = ({ href, children, ...linkProps }: any) => {
	return (
		<a href={href} {...linkProps}>
			{children}
		</a>
	);
};

export default MockedLink;
