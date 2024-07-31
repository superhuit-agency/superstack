type MediaUploadType = any; // TODO: type this

interface ImageEditProps {
	attributes: ImageAttributes & { id: number };
	canDelete?: boolean;
	className?: string;
	hasCaption?: boolean;
	isCover?: boolean;
	isSelected: boolean;
	onChange: Function;
	ratioWidth?: number;
	ratioHeight?: number;
}
