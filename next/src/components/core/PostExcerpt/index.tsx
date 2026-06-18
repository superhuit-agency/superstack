export default function PostExcerpt(props: PostExcerptProps) {
	return (
		<div
			className="wp-block-post-excerpt"
			dangerouslySetInnerHTML={{ __html: props.content }}
		/>
	);
}
