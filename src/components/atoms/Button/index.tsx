import { FC } from 'react';
import cx from 'classnames';

import { Link } from '@/components/atoms/Link';

import block from './block.json';

// styles
import './styles.css';

export const Button: FC<ButtonProps> & BlockConfigs = ({
	title = '',
	className,
	variant = 'primary',
	...props
}) => {
	return title ? (
		<Link
			className={cx('supt-button', `-${variant}`, className)}
			{...props}
		>
			<span className="supt-button__inner">
				<span>{title}</span>
			</span>
		</Link>
	) : null;
};

Button.slug = block.slug;
Button.title = block.title;
