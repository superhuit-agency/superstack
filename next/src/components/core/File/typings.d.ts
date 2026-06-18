interface FileAttributes {
	href: string;
	fileName?: string;
	downloadButtonText?: string;
	previewHeight?: number;
	textLinkHref?: string;
	textLinkTarget?: '_self' | '_blank';
	showDownloadButton?: boolean;
	displayPreview?: boolean;
}

interface FileProps extends HTMLProps<HTMLDivElement>, FileAttributes {}
