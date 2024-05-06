import { FC, HTMLProps } from 'react';
import cx from 'classnames';

// Internal dependencies
import { BlockConfigs } from '@/typings';

import block from './block.json';

// Styles
import './styles.css';

/**
 * TYPINGS
 */
interface ParagraphProps extends HTMLProps<HTMLParagraphElement> {
	content: string;
}

/**
 * COMPONENT
 */
export const Paragraph: FC<ParagraphProps> & BlockConfigs = ({
	content,
	className,
}) => {
	if (!content) return null;

	return (
		<p
			className={cx('supt-paragraph', className)}
			dangerouslySetInnerHTML={{ __html: content }}
		/>
	);
};

Paragraph.slug = block.slug;
Paragraph.title = block.title;
