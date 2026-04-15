import cx from "classnames";
import NextImage from "next/image";

import block from "./block.json";

import "./styles.css";

export default function MediaText({
  mediaType,
  mediaUrl,
  mediaAlt,
  mediaPosition,
  mediaWidth,
  imageFill,
  focalPoint,
  children,
  ...props
}: MediaTextProps) {
  console.log(props);
  return (
    <div
      className={cx("wp-block-media-text", {
        "has-media-on-the-right": mediaPosition === "right",
        "is-image-fill-element": imageFill,
      })}
      style={{
        gridTemplateColumns:
          mediaWidth !== 50 ? `${mediaWidth}% auto` : undefined,
      }}
    >
      <figure className="wp-block-media-text__media">
        {mediaType === "video" ? (
          <video src={mediaUrl} controls />
        ) : (
          <NextImage
            src={mediaUrl}
            alt={mediaAlt}
            fill={true}
            style={{
              objectPosition: focalPoint
                ? `${focalPoint.x}% ${focalPoint.y}%`
                : undefined,
            }}
          />
        )}
      </figure>
      <div className="wp-block-media-text__content">{children}</div>
    </div>
  );
}

MediaText.slug = block.slug;
MediaText.title = block.title;
