import cx from "classnames";
import NextImage from "next/image";

import block from "./block.json";

import "./styles.css";

export default function Cover({
  overlayColor,
  url,
  dimRatio,
  minHeight,
  focalPoint,
  children
}: CoverProps) {
  return (
    <div className="supt-cover" style={{ minHeight }}>
      {url ? (
        <NextImage
          src={url}
          fill
          alt=""
          className="supt-cover__image"
          style={{
            objectPosition: focalPoint
              ? `${focalPoint.x}% ${focalPoint.y}%`
              : undefined,
          }}
        />
      ) : null}
      <span
        aria-hidden="true"
        className={cx("supt-cover__background", `-is-dimmed-${dimRatio}`)}
        style={{
          backgroundColor: `var(--wp--preset--color--${overlayColor})`,
        }}
      />
      <div className="supt-cover__content">{children}</div>
    </div>
  );
}

Cover.slug = block.slug;
Cover.title = block.title;
