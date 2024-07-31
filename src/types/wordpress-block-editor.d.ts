declare module '@wordpress/block-editor' {
	module '@wordpress/block-editor' {
		interface BlockControlsProps
			extends React.ComponentProps<typeof OriginalBlockControls> {
			group?: string;
			controls?: string[];
			children: React.ReactNode;
		}

		interface InspectorAdvancedControlsProps {
			children: React.ReactNode;
		}

		interface RichTextProps {
			className?: string;
			tagName?: string;
			placeholder?: string;
			value?: string;
			onChange(value: string): void;
			multiline?: boolean;
			allowedFormats?: string[];
		}

		interface InspectorControlsProps {}

		interface PlainTextProps {
			className?: string;
			placeholder?: string;
			value?: string;
			onChange(value: string): void;
			onFocus?(): void;
			onBlur?(): void;
			multiline?: string;
		}

		interface InnerBlocksProps {
			allowedBlocks?: string[];
			template?: Array<Array<any>>;
			templateLock?: boolean | 'all' | 'insert' | 'replace';
		}

		const InnerBlocks: React.ComponentType<InnerBlocksProps> & {
			Content: React.ComponentType;
		};

		interface MediaReplaceFlowProps {
			mediaId: number;
			mediaType?: 'image' | 'video' | 'audio';
			mediaURL?: string;
			allowedTypes?: string[];
			accept: string;
			onSelect: (media: { id: number; url: string }) => void;
			onSelectURL?: (url: string) => void;
		}

		interface MediaPlaceholderProps {
			icon?: string;
			labels?: {
				title?: string;
				instructions: string;
			};
			onSelect: (media: { id: number; url: string }) => void;
			onSelectURL?: (url: string) => void;
			value?: { id: number; url: string };
			accept?: string;
			allowedTypes: string[];
			notices?: string[];
			disableMediaButtons?: boolean;
			isSelected?: boolean;
		}

		interface MediaUploadCheckProps {
			children: React.ReactNode;
		}

		interface MediaUploadProps {
			onSelect: (media: { id: number; url: string }) => void;
			value?: number;
			allowedTypes: string[];
			render: (props: { open: boolean }) => React.ReactNode;
			title?: string;
		}

		const BlockControls: React.ComponentType<BlockControlsProps>;
		const InspectorAdvancedControls: React.ComponentType<InspectorAdvancedControlsProps>;
		const RichText: React.ComponentType<RichTextProps>;
		const InspectorControls: React.ComponentType<InspectorAdvancedControlsProps>;
		const PlainText: React.ComponentType<PlainTextProps>;
		const MediaPlaceholder: React.ComponentType<MediaPlaceholderProps>;
		const MediaReplaceFlow: React.ComponentType<MediaReplaceFlowProps>;
		const MediaUpload: React.ComponentType<MediaUploadProps>;
		const MediaUploadCheck: React.ComponentType<MediaUploadCheckProps>;
	}
}
