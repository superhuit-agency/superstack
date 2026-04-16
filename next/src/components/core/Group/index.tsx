import cx from 'classnames';
import { createElement } from 'react';

import block from './block.json';

import './styles.css';

export default function Group({
  tagName = 'div',
  layout,
  className,
  children,
  ...props
}: GroupProps) {
  const classes = cx(
    'wp-block-group',
    className,
    layout?.type && `is-layout-${layout.type}`,
  );

  return createElement(tagName, { className: classes, ...props }, children);
}

Group.slug = block.slug;
Group.title = block.title;
