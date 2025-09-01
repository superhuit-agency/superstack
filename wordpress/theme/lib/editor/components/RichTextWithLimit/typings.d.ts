import type { RichTextProps } from '@wordpress/block-editor';

interface RichTextWithLimitProps extends RichTextProps {
	limit: number;
}
