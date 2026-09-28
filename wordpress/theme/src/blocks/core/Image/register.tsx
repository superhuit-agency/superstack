import { useEffect, useRef } from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { addFilter } from '@wordpress/hooks';

import block from '@/components/core/Image/block.json';

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

		const previousImageId = useRef(imageId);

		useEffect(() => {
			if (!isImageBlock) return;

			// The image was replaced or removed: the dimensions of the previous
			// media must not be kept.
			const hasImageChanged = previousImageId.current !== imageId;

			const clearDimensions = () => {
				if (!width && !height) return;

				props.setAttributes({
					width: undefined,
					height: undefined,
				});
			};

			if (aspectRatio || !imageId) {
				previousImageId.current = imageId;
				clearDimensions();

				return;
			}

			const mediaWidth = media?.media_details?.width;
			const mediaHeight = media?.media_details?.height;

			// The new media is not loaded yet, only drop the stale dimensions.
			if (!mediaWidth || !mediaHeight) {
				if (hasImageChanged) clearDimensions();

				return;
			}

			const nextWidth = hasImageChanged
				? `${mediaWidth}px`
				: width || `${mediaWidth}px`;
			const nextHeight = hasImageChanged
				? `${mediaHeight}px`
				: height || `${mediaHeight}px`;

			previousImageId.current = imageId;

			if (width === nextWidth && height === nextHeight) return;

			props.setAttributes({
				width: nextWidth,
				height: nextHeight,
			});
		}, [aspectRatio, imageId, isImageBlock, media, width, height, props]);

		return <BlockEdit {...props} />;
	};

	return EnhancedComponent;
}, 'editImageBlock');

addFilter('editor.BlockEdit', 'supt/image-edit-block', editImageBlock);
