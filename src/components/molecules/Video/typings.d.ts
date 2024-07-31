interface VideoAttributes extends BlockAttributes {
	caption?: string;
	id?: string;
	poster?: ImageProps;
	source?: 'youtube' | 'vimeo';
	src?: string;
}

interface VideoProps
	extends VideoAttributes,
		React.HTMLProps<HTMLVideoElement> {}
