import { FC } from 'react';
import cx from 'classnames';

// Internal dependencies
import block from './block.json';

// Styles
import './styles.css';

export const Paragraph: FC<ParagraphProps> & BlockConfigs = ({
	content,
	className,
}) => {
	if (!content) return null;

	return (
		<div
			className={cx('supt-paragraph', className)}
			dangerouslySetInnerHTML={{ __html: content }}
		></div>
	);
};

Paragraph.slug = block.slug;
Paragraph.title = block.title;
