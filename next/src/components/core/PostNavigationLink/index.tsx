import Link from 'next/link';

export default function PostNavigationLink(props: PostNavigationLinkProps) {
	if (!props.navigationPost) {
		return null;
	}

	return (
		<Link
			href={props.navigationPost?.uri || ''}
			className="wp-block-post-navigation-link"
		>
			{props.linkLabel
				? props.navigationPost?.title
				: props.type === 'next'
					? 'Next'
					: 'Previous'}
		</Link>
	);
}
