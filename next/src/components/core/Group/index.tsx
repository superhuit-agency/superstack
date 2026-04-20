import cx from 'classnames';
import { createElement } from 'react';

import block from './block.json';

import './styles.css';

export default function Group({
  tagName = 'div',
  layout,
  className,
  templateLock: _templateLock,
  style,
  children,
  ...props
}: GroupProps) {
  const layoutType = layout?.type;
  const isFlex = layoutType === 'flex';
  const isStack = isFlex && layout?.orientation === 'vertical';
  const isNoWrap = isFlex && layout?.flexWrap !== 'wrap';
  const justifyContent = layout?.justifyContent;

  const classes = cx(
    'wp-block-group',
    className,
    layoutType && `is-layout-${layoutType}`,
    layoutType && `wp-block-group-is-layout-${layoutType}`,
    isStack && 'is-vertical',
    isNoWrap && 'is-nowrap',
    justifyContent && `is-content-justification-${justifyContent}`,
  );

  const classColumnCount = className?.match(/\bhas-(\d+)-columns\b/)?.[1];
  const columnCount = layout?.columnCount ?? Number(classColumnCount);
  const minimumColumnWidth = layout?.minimumColumnWidth ?? '12rem';

  const gridStyle: React.CSSProperties =
    layoutType === 'grid'
      ? columnCount > 0
        ? { gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }
        : {
            gridTemplateColumns: `repeat(auto-fill, minmax(min(${minimumColumnWidth}, 100%), 1fr))`,
            containerType: 'inline-size',
          }
      : {};

  const mergedStyle: React.CSSProperties = {
    ...(typeof style === 'object' && style && !Array.isArray(style) ? style : {}),
    ...gridStyle,
  };

  return createElement(
    tagName,
    {
      ...props,
      className: classes,
      style: Object.keys(mergedStyle).length ? mergedStyle : undefined,
    },
    children,
  );
}

Group.slug = block.slug;
Group.title = block.title;
