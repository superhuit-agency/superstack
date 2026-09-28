import type { ComponentProps } from 'react';
import type { RichText } from '@wordpress/block-editor';

interface RichTextWithLimitProps extends ComponentProps<typeof RichText> {
	limit: number;
}
