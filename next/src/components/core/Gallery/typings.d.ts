interface GalleryAttributes {
	children: React.ReactNode;
	columns?: number;
	imageCrop?: boolean;
}

interface GalleryProps extends HTMLProps<HTMLDivElement>, GalleryAttributes {}
