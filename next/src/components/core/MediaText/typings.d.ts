interface MediaTextAttributes {
	mediaType: 'image' | 'video';
	mediaUrl: string;
	mediaAlt: string;
	mediaPosition: 'left' | 'right';
	mediaWidth?: number;
	imageFill?: boolean;
	focalPoint?: FocalPoint;
}

interface MediaTextProps
	extends React.HTMLProps<HTMLDivElement>, MediaTextAttributes {}
