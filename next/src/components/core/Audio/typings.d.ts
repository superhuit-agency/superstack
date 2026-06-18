interface AudioAttributes {
	src: string;
	autoplay?: boolean;
	loop?: boolean;
	preload?: 'none' | 'metadata' | 'auto';
}

interface AudioProps extends HTMLProps<HTMLDivElement>, AudioAttributes {}
