import NextImage from 'next/image';

export default function PostFeaturedImage(props: PostFeaturedImageProps) {
	if (!props.featuredImage) return null;

	const { width, height } = props.featuredImage.mediaDetails ?? {};
	// No intrinsic size (e.g. an SVG): fill the block's width at the image's own aspect ratio
	const size =
		typeof width === 'number' && typeof height === 'number'
			? { width, height }
			: {
					width: 0,
					height: 0,
					sizes: '100vw',
					style: { width: '100%', height: 'auto' },
				};

	return (
		<div className="wp-block-post-feature-image">
			<NextImage
				src={props.featuredImage.sourceUrl}
				alt={props.featuredImage.altText}
				{...size}
			/>
		</div>
	);
}
