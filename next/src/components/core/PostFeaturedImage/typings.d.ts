interface PostFeaturedImageAttributes extends BlockAttributes {
	postId?: number;
}

interface PostFeaturedImageProps extends PostFeaturedImageAttributes {
	featuredImage: {
		sourceUrl: string;
		altText: string;
		mediaDetails: {
			width: number;
			height: number;
		};
	};
}
