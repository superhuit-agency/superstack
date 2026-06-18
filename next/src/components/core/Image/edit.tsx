import { useEffect } from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';

import block from './block.json';

/**
 * Backfill dimensions from media details when they are missing on the block.
 * This ensures `width`/`height` are present in saved block attributes (needed for Next.js image optimization).
 */
// @ts-expect-error - don't want to specify the type to avoid complexifying the code
const editImageBlock = createHigherOrderComponent((BlockEdit) => {
	// @ts-expect-error - don't want to specify the type to avoid complexifying the code
	const EnhancedComponent = (props) => {
		const isImageBlock = props.name === block.slug;

		const imageId = props.attributes?.id;
		const width = props.attributes?.width;
		const height = props.attributes?.height;
		const aspectRatio = props.attributes?.aspectRatio;

		const media = useSelect(
			// @ts-expect-error - don't want to specify the type to avoid complexifying the code
			(select) =>
				imageId ? select('core').getMedia(imageId) : undefined,
			[imageId]
		);

		useEffect(() => {
			if (!isImageBlock) return;

			if (aspectRatio) {
				props.setAttributes({
					width: undefined,
					height: undefined,
				});

				return;
			}

			const mediaWidth = media?.media_details?.width;
			const mediaHeight = media?.media_details?.height;
			const nextWidth =
				width || (mediaWidth ? `${mediaWidth}px` : undefined);
			const nextHeight =
				height || (mediaHeight ? `${mediaHeight}px` : undefined);

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
}, 'editImageBlock');

export const ImageEditBlock: WpFilterType = {
	hook: 'editor.BlockEdit',
	namespace: 'supt/image-edit-block',
	callback: editImageBlock,
};
