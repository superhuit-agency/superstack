interface CoverAttributes {
	overlayColor?: string;
	url?: string;
	dimRatio?: number;
	minHeight?: number;
	focalPoint?: FocalPoint;
	children: React.ReactNode;
}

interface CoverProps extends HTMLProps<HTMLDivElement>, CoverAttributes {}
