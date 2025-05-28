import { FC } from 'react';
import cx from 'classnames';

import './styles.css';

export const Heading: FC<HeadingProps> = ({
	className = '',
	content,
	level,
}) => {
	const HTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

	// If there is no content, do not display anything
	if (!content) return null;

	return (
		<HTag
			aria-level={level}
			className={cx('supt-heading', className)}
			dangerouslySetInnerHTML={{ __html: content }}
		/>
	);
};
