import cx from 'classnames';
import { FC } from 'react';

import block from './block.json';

import './styles.css';

const Columns: FC<ColumnsProps> & BlockConfigs = ({
	isStackedOnMobile = true,
	verticalAlignment,
	layout,
	className,
	children,
	...props
}) => {
	const layoutType = layout?.type ?? 'flex';

	return (
		<div
			className={cx(
				'wp-block-columns',
				className,
				`is-layout-${layoutType}`,
				`wp-block-columns-is-layout-${layoutType}`,
				{
					'is-not-stacked-on-mobile': !isStackedOnMobile,
				},
				verticalAlignment &&
					`are-vertically-aligned-${verticalAlignment}`
			)}
			{...props}
		>
			{children}
		</div>
	);
};

Columns.slug = block.slug;
Columns.title = block.title;

export default Columns;
