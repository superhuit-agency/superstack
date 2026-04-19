import cx from 'classnames';
import { createElement } from 'react';

import block from './block.json';

import './styles.css';

export default function Group({
  tagName = 'div',
  layout,
  className,
  templateLock: _templateLock,
  children,
  ...props
}: GroupProps) {
  const layoutType = layout?.type;
  const isFlex = layoutType === 'flex';
  const isStack = isFlex && layout?.orientation === 'vertical';
  const isRow =
    isFlex &&
    !isStack &&
    layout?.flexWrap !== 'wrap';

  const classes = cx(
    'wp-block-group',
    className,
    layoutType && `is-layout-${layoutType}`,
    layoutType && `wp-block-group-is-layout-${layoutType}`,
    isStack && 'is-vertical',
    isRow && 'is-nowrap',
  );

  return createElement(
    tagName,
    { ...props, className: classes },
    children,
  );
}

Group.slug = block.slug;
Group.title = block.title;
