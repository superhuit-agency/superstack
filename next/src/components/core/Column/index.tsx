import cx from 'classnames';
import { FC } from 'react';

import block from './block.json';

import './styles.css';

const Column: FC<ColumnProps> & BlockConfigs = ({
  className,
  style,
  width,
  verticalAlignment: _verticalAlignment,
  templateLock: _templateLock,
  children,
  ...props
}) => {
  const mergedStyle: React.CSSProperties = {
    ...(typeof style === 'object' && style && !Array.isArray(style) ? style : {}),
    ...(width ? { flexBasis: width } : {}),
  };

  return (
    <div
      className={cx('wp-block-column', className)}
      style={Object.keys(mergedStyle).length ? mergedStyle : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

Column.slug = block.slug;
Column.title = block.title;

export default Column;
