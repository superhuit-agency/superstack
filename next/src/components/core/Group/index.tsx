import cx from 'classnames';
import { createElement } from 'react';

import block from './block.json';

import './styles.css';

export default function Group({
	tagName = 'div',
	layout,
	className,
	style,
	children,
	...props
}: GroupProps) {
	const layoutType = layout?.type;
	const isFlex = layoutType === 'flex';
	const isStack = isFlex && layout?.orientation === 'vertical';
	const isNoWrap = isFlex && layout?.flexWrap !== 'wrap';
	const justifyContent = layout?.justifyContent;
	const isGrid = layoutType === 'grid';

	const classes = cx(
		'wp-block-group',
		className,
		layoutType && `is-layout-${layoutType}`,
		layoutType && `wp-block-group-is-layout-${layoutType}`,
		isStack && 'is-vertical',
		isNoWrap && 'is-nowrap',
		justifyContent && `is-content-justification-${justifyContent}`
	);

	const columnCount = layout?.columnCount;
	const minimumColumnWidth = layout?.minimumColumnWidth ?? undefined;

	const gridStyle: React.CSSProperties | undefined = isGrid
		? columnCount && columnCount > 0
			? { gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }
			: {
					gridTemplateColumns: minimumColumnWidth
						? `repeat(auto-fill, minmax(min(${minimumColumnWidth}, 100%), 1fr))`
						: undefined,
				}
		: undefined;

	const groupStyle = gridStyle ? { ...style, ...gridStyle } : style;

	return createElement(
		tagName,
		{
			...props,
			className: classes,
			style: groupStyle,
		},
		children
	);
}

Group.slug = block.slug;
Group.title = block.title;
