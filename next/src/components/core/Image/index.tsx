import cx from "classnames";
import { FC, forwardRef } from "react";
import NextImage from "next/image";

import block from "./block.json";
import "./styles.css";

const getCaptionText = (caption?: string) => {
  if (!caption) return "";

  // WP may send a full figcaption HTML string in block attributes.
  return caption.replace(/<[^>]+>/g, "").trim();
};

const Image: FC<ImageProps> & BlockConfigs = forwardRef<
  HTMLImageElement,
  ImageProps
>(
  (
    {
      url,
      alt = "",
      width,
      height,
      caption,
      aspectRatio,
      priority = false,
      fill = false,
      quality = 95,
      scale,
      sizeSlug,
      className,
      style,
      focalPoint,
    },
    ref,
  ) => {
    if (!url) return null;

    const isFilled = fill || !!aspectRatio;

    const normalizedWidth = width ? parseInt(width) : undefined;
    const normalizedHeight = height ? parseInt(height) : undefined;
    const hasValidDimensions =
      Number.isFinite(normalizedWidth) && Number.isFinite(normalizedHeight);
    const captionText = getCaptionText(caption);

    if (!isFilled && !hasValidDimensions) return null;

    return (
      <figure
        ref={ref}
        style={style}
        className={cx("wp-block-image", className, {
          [`size-${sizeSlug}`]: sizeSlug,
          'has-aspect-ratio': aspectRatio,
        })}
      >
        <NextImage
          src={url}
          alt={alt}
          className="wp-block__image"
          width={isFilled || !hasValidDimensions ? undefined : normalizedWidth}
          height={isFilled || !hasValidDimensions ? undefined : normalizedHeight}
          priority={priority}
          quality={quality}
          fill={isFilled}
          unoptimized={
            (url as string)?.endsWith?.(".svg") ||
            process.env.NEXT_PUBLIC_IS_THIS_NEXT !== "true" // Only optimise image if in Nextjs (we don't want to optimize images on WP side as there isn't Next server running)
          }
          style={{
            objectPosition: focalPoint
              ? `${focalPoint.x}% ${focalPoint.y}%`
              : undefined,
            aspectRatio: aspectRatio || undefined,
            objectFit: scale || undefined,
          }}
        />
        {captionText && (
          <figcaption className="wp-element-caption">{captionText}</figcaption>
        )}
      </figure>
    );
  },
);

Image.displayName = "Image";

Image.slug = block.slug;
Image.title = block.title;

export default Image;
