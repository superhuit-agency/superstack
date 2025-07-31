import { useCallback, useEffect } from 'react';

import {
	getBlockTypes,
	registerBlockType,
	unregisterBlockType,
} from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';

const BlocksWhitelist = (): JSX.Element | null => {
	const { postType } = useSelect((select) => {
		const { getCurrentPostType } = select('core/editor');
		//@ts-expect-error
		const postType = getCurrentPostType();

		return {
			postType,
		};
	}, []);

	const whiteListBlocks = useCallback((postType: PostType) => {
		const blockTypes = getBlockTypes();
		blockTypes.forEach((blockType) => {
			if (blockType.name === 'core/block') return; // Skip core/block as it's used for pattern/reusable blocks

			if (
				!(
					blockType as WpBlockType<any>['settings']
				).postTypes?.includes(postType)
			) {
				const block = unregisterBlockType(blockType.name);
				if (block) {
					//@ts-ignore // .parent is readOnly but we ignore it anyway
					block.parent = [];
					registerBlockType(blockType.name, block);
				}
			}
		});
	}, []);

	useEffect(() => {
		if (!postType || postType === 'wp_block') return; // Skip wp_block post type as it's used for patterns

		whiteListBlocks(postType);
	}, [whiteListBlocks, postType]);

	return null;
};

registerPlugin('supt-blocks-whitelisting', {
	icon: (): null => null,
	render: BlocksWhitelist,
});
