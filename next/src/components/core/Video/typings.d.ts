interface VideoAttributes {
	caption?: string;
	autoplay?: boolean;
	tracks?: Array<{
		kind: string;
		label: string;
		src: string;
		srclang: string;
	}>;
}

interface VideoProps
	extends React.HTMLProps<HTMLVideoElement>, VideoAttributes {}
