import cx from 'classnames';

import block from './block.json';

import './styles.css';

export default function Columns({
  isStackedOnMobile = true,
  verticalAlignment,
  className,
  children,
  ...props
}: ColumnsProps) {
  return (
    <div
      className={cx(
        'wp-block-columns',
        className,
        {
          'is-not-stacked-on-mobile': !isStackedOnMobile,
        },
        verticalAlignment && `are-vertically-aligned-${verticalAlignment}`,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

Columns.slug = block.slug;
Columns.title = block.title;
