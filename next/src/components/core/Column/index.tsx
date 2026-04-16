import cx from 'classnames';

import block from './block.json';

import './styles.css';

export default function Column({
  verticalAlignment,
  width,
  className,
  style,
  children,
  ...props
}: ColumnProps) {
  return (
    <div
      className={cx(
        'wp-block-column',
        className,
        verticalAlignment && `is-vertically-aligned-${verticalAlignment}`,
      )}
      style={{ ...style, flexBasis: width || style?.flexBasis }}
      {...props}
    >
      {children}
    </div>
  );
}

Column.slug = block.slug;
Column.title = block.title;
