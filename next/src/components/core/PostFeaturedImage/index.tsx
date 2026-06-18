import NextImage from 'next/image';

export default function PostFeaturedImage(props: PostFeaturedImageProps) {
	return (
		<div className="wp-block-post-feature-image">
			<NextImage
				src={props.featuredImage.sourceUrl}
				alt={props.featuredImage.altText}
				width={props.featuredImage.mediaDetails.width}
				height={props.featuredImage.mediaDetails.height}
			/>
		</div>
	);
}
