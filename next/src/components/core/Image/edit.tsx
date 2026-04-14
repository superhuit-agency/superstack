import { useEffect } from "react";
import { createHigherOrderComponent } from "@wordpress/compose";
import { useSelect } from "@wordpress/data";

import block from "./block.json";

/**
 * Ensure `width` and `height` exist on core/image attributes.
 */
const withImageDimensions = (
  settings: WpBlockType<unknown>["settings"],
  name: string,
) => {
  if (name !== block.slug) return settings;

  settings.attributes = {
    ...settings.attributes,
    width: {
      type: "number",
    },
    height: {
      type: "number",
    },
  };

  return settings;
};

export const ImageEditBlockSettings: WpFilterType = {
  hook: "blocks.registerBlockType",
  namespace: "supt/image-edit-dimensions",
  callback: withImageDimensions,
};

/**
 * Backfill dimensions from media details when they are missing on the block.
 * This ensures `width`/`height` are present in saved block attributes (needed for Next.js image optimization).
 */
// @ts-expect-error - don't want to specify the type to avoid complexifying the code
const editImageBlock = createHigherOrderComponent((BlockEdit) => {
  // @ts-expect-error - don't want to specify the type to avoid complexifying the code
  const EnhancedComponent = (props) => {
    const isImageBlock = props.name === block.slug;

    const imageId = props.attributes?.id as number | undefined;
    const width = props.attributes?.width as number | undefined;
    const height = props.attributes?.height as number | undefined;

    const media = useSelect(
      // @ts-expect-error - don't want to specify the type to avoid complexifying the code
      (select) => (imageId ? select("core").getMedia(imageId) : undefined),
      [imageId],
    );

    useEffect(() => {
      if (!isImageBlock) return;

      const mediaWidth = media?.media_details?.width;
      const mediaHeight = media?.media_details?.height;
      const nextWidth = width || mediaWidth;
      const nextHeight = height || mediaHeight;

      if (!nextWidth || !nextHeight) return;
      if (width === nextWidth && height === nextHeight) return;

      props.setAttributes({
        width: nextWidth,
        height: nextHeight,
      });
    }, [isImageBlock, media, width, height, props]);

    return <BlockEdit {...props} />;
  };

  return EnhancedComponent;
}, "editImageBlock");

export const ImageEditBlock: WpFilterType = {
  hook: "editor.BlockEdit",
  namespace: "supt/image-edit-block",
  callback: editImageBlock,
};

export const ImageBlock = {
  slug: block.slug,
};
