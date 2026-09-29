import cx from 'classnames';
import { createElement } from 'react';

import block from './block.json';

import './styles.css';

const PRESET_VALUE_REGEX = /^var:preset\|([^|]+)\|(.+)$/;

function getSpacingValue(value?: string): string | undefined {
	if (!value || value === '0') return undefined;

	const preset = value.match(PRESET_VALUE_REGEX);

	return preset ? `var(--wp--preset--${preset[1]}--${preset[2]})` : value;
}

function getSpacingStyle(
	property: 'padding' | 'margin',
	values?: BoxSpacing
): React.CSSProperties | undefined {
	if (!values) return undefined;

	return {
		[`${property}Top`]: getSpacingValue(values.top),
		[`${property}Right`]: getSpacingValue(values.right),
		[`${property}Bottom`]: getSpacingValue(values.bottom),
		[`${property}Left`]: getSpacingValue(values.left),
	};
}

export default function Group({
	tagName = 'div',
	layout,
	className,
	anchor,
	style,
	children,
}: GroupProps) {
	const layoutType = layout?.type;
	const isFlex = layoutType === 'flex';
	const isStack = isFlex && layout?.orientation === 'vertical';
	const isNoWrap = isFlex && layout?.flexWrap !== 'wrap';
	const justifyContent = layout?.justifyContent;
	const verticalAlignment = layout?.verticalAlignment;
	const isGrid = layoutType === 'grid';

	const classes = cx(
		'wp-block-group',
		className,
		layoutType && `is-layout-${layoutType}`,
		layoutType && `wp-block-group-is-layout-${layoutType}`,
		isStack && 'is-vertical',
		isNoWrap && 'is-nowrap',
		justifyContent && `is-content-justification-${justifyContent}`,
		verticalAlignment && `is-vertically-aligned-${verticalAlignment}`
	);

	const columnCount = layout?.columnCount;
	const minimumColumnWidth = layout?.minimumColumnWidth ?? undefined;

	const gridContainerStyle: React.CSSProperties | undefined = isGrid
		? columnCount && columnCount > 0
			? { gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }
			: {
					gridTemplateColumns: minimumColumnWidth
						? `repeat(auto-fill, minmax(min(${minimumColumnWidth}, 100%), 1fr))`
						: undefined,
				}
		: undefined;

	const gridChildStyle = style?.layout?.columnSpan
		? {
				gridColumn: `${style?.layout?.columnStart || 'auto'} / span ${style?.layout?.columnSpan}`,
			}
		: undefined;

	const spacingStyle = {
		...getSpacingStyle('padding', style?.spacing?.padding),
		...getSpacingStyle('margin', style?.spacing?.margin),
	};

	return createElement(
		tagName,
		{
			className: classes,
			id: anchor,
			style: {
				...gridContainerStyle,
				...gridChildStyle,
				...spacingStyle,
			},
		},
		children
	);
}

Group.slug = block.slug;
Group.title = block.title;
