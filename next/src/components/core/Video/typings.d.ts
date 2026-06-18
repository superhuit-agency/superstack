interface VideoAttributes {
	caption?: string;
	autoplay?: boolean;
}

interface VideoProps
	extends React.HTMLProps<HTMLVideoElement>, VideoAttributes {}
