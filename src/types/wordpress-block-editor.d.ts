declare module '@wordpress/block-editor' {
	import { BlockControls as OriginalBlockControls } from '@wordpress/block-editor';

	module '@wordpress/block-editor' {
		export interface BlockControlsProps
			extends React.ComponentProps<typeof OriginalBlockControls> {
			group?: string;
			controls?: string[];
			children: React.ReactNode;
		}

		export interface InspectorAdvancedControlsProps {
			children: React.ReactNode;
		}

		export interface RichTextProps {
			className?: string;
			tagName?: string;
			placeholder?: string;
			value?: string;
			onChange(value: string): void;
			multiline?: boolean;
			allowedFormats?: string[];
		}

		export interface InspectorControlsProps {}

		export interface PlainTextProps {
			className?: string;
			placeholder?: string;
			value?: string;
			onChange(value: string): void;
			onFocus?(): void;
			onBlur?(): void;
			multiline?: string;
		}

		export interface InnerBlocksProps {
			allowedBlocks?: string[];
			template?: Array<Array<any>>;
			templateLock?: boolean | 'all' | 'insert' | 'replace';
		}

		export const InnerBlocks: React.ComponentType<InnerBlocksProps> & {
			Content: React.ComponentType;
		};

		export interface MediaReplaceFlowProps {
			mediaId: number;
			mediaType?: 'image' | 'video' | 'audio';
			mediaURL?: string;
			allowedTypes?: string[];
			accept: string;
			onSelect: (media: { id: number; url: string }) => void;
			onSelectURL?: (url: string) => void;
		}

		export interface MediaPlaceholderProps {
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

		export interface MediaUploadCheckProps {
			children: React.ReactNode;
		}

		export interface MediaUploadProps {
			onSelect: (media: { id: number; url: string }) => void;
			value?: number;
			allowedTypes: string[];
			render: (props: { open: boolean }) => React.ReactNode;
			title?: string;
		}

		export const BlockControls: React.ComponentType<BlockControlsProps>;
		export const InspectorAdvancedControls: React.ComponentType<InspectorAdvancedControlsProps>;
		export const RichText: React.ComponentType<RichTextProps>;
		export const InspectorControls: React.ComponentType<InspectorAdvancedControlsProps>;
		export const PlainText: React.ComponentType<PlainTextProps>;
		export const MediaPlaceholder: React.ComponentType<MediaPlaceholderProps>;
		export const MediaReplaceFlow: React.ComponentType<MediaReplaceFlowProps>;
		export const MediaUpload: React.ComponentType<MediaUploadProps>;
		export const MediaUploadCheck: React.ComponentType<MediaUploadCheckProps>;
	}
}
