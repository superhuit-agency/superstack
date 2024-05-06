import { useCallback, useEffect } from 'react';

import {
	getBlockTypes,
	registerBlockType,
	unregisterBlockType,
} from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';

import { CoreEditorSelector } from '#/typings';
import { PostType, WpBlockType } from '@/typings';

const BlocksWhitelist = () => {
	const { postType } = useSelect((select) => {
		const { getCurrentPostType } = select(
			'core/editor'
		) as CoreEditorSelector;
		const postType = getCurrentPostType();

		return {
			postType,
		};
	}, []);

	const whiteListBlocks = useCallback((postType: PostType) => {
		const blockTypes = getBlockTypes();
		blockTypes.forEach((blockType) => {
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
		whiteListBlocks(postType);
	}, [whiteListBlocks, postType]);

	return null;
};

registerPlugin('supt-blocks-whitelisting', {
	icon: () => null,
	render: BlocksWhitelist,
});
