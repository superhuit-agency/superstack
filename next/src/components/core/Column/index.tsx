import cx from 'classnames';
import { FC } from 'react';

import block from './block.json';

import './styles.css';

const Column: FC<ColumnProps> & BlockConfigs = ({
  className,
  style,
  width,
  children,
  ...props
}) => {
  const columnStyle = width ? { ...style, flexBasis: width } : style;

  return (
    <div
      className={cx('wp-block-column', className)}
      style={columnStyle}
      {...props}
    >
      {children}
    </div>
  );
};

Column.slug = block.slug;
Column.title = block.title;

export default Column;
