import cx from 'classnames';

import block from './block.json';

import './styles.css';

export default function Gallery({
  children,
  columns,
  imageCrop,
}: GalleryProps) {
  return (
    <div
      className={cx('wp-block-gallery', {
        [`columns-${columns}`]: columns !== undefined,
        [`columns-default`]: columns === undefined,
        'is-cropped': imageCrop,
      })}
    >
      {children}
    </div>
  );
}

Gallery.slug = block.slug;
Gallery.title = block.title;
