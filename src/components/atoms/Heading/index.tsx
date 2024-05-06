import { FC, HTMLProps } from 'react';
import cx from 'classnames';

import './styles.css';

/**
 * TYPINGS
 */
interface HeadingProps extends HTMLProps<HTMLHeadingElement> {
	content: string;
	level: number;
}

/**
 * COMPONENT
 */
export const Heading: FC<HeadingProps> = ({
	content,
	level,
	className = '',
}) => {
	const HTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

	if (!content) return null;

	return (
		<HTag
			className={cx('supt-heading', className)}
			dangerouslySetInnerHTML={{ __html: content }}
		/>
	);
};
