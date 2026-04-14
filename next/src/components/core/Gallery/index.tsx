import cx from "classnames";

import block from "./block.json";

import "./styles.css";

export default function Gallery({
  children,
  columns,
  imageCrop,
  ...props
}: GalleryProps) {
  console.log(props);
  return (
    <div
      className={cx("supt-gallery", {
        [`-has-${columns}-columns`]: columns !== undefined,
        [`-has-columns-default`]: columns === undefined,
        "-is-cropped": imageCrop,
      })}
    >
      {children}
    </div>
  );
}

Gallery.slug = block.slug;
Gallery.title = block.title;
