interface ImageAttributes extends BlockAttributes {
	id?: number;
	src?: string;
	alt?: string;
	width?: number;
	height?: number;
	caption?: string;
}

interface ImageProps
	extends ImageAttributes,
		React.HTMLProps<HTMLImageElement>,
		BlockProps {
	alt: string;
	caption?: string | React.ReactNode;
	children?: React.ReactNode;
	fill?: boolean;
	priority?: boolean;
	quality?: number;
	sizes?: string;
	src: string | StaticImageData;
	style?: CSSProperties;
	placeholder?: any; // TODO: fix placeholder type with Next/ImageProps.placholder
}

interface GraphQLImageFields {
	sourceUrl: string;
	altText: string;
	caption: string;
	mediaDetails: {
		width: number;
		height: number;
	};
}
