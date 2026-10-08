interface PostFeaturedImageAttributes extends BlockAttributes {
	postId?: number;
}

interface PostFeaturedImageProps extends PostFeaturedImageAttributes {
	featuredImage: {
		sourceUrl: string;
		altText: string;
		/** `width` and `height` are null for an SVG. */
		mediaDetails: {
			width: number | null;
			height: number | null;
		} | null;
	};
}
