import { BlockEditProps } from '@wordpress/blocks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { ComponentType } from 'react';

import block from './block.json';

// styles
import './styles.css';

/**
 * Add custom className to core/list block
 */
const withCustomClassName = createHigherOrderComponent(
	(BlockListBlock: ComponentType<any>) => {
		const EnhancedComponent = (props: BlockEditProps<any>) => {
			if ((props as any).name !== block.slug)
				return <BlockListBlock {...props} />;

			return <BlockListBlock {...props} className="supt-list" />;
		};

		return EnhancedComponent;
	},
	'withCustomClassName'
);

export const ListEditBlockClassName: WpFilterType = {
	hook: 'editor.BlockListBlock',
	namespace: 'supt/list-edit-classname',
	callback: withCustomClassName,
};

/**
 * Add custom `postTypes` to core/list block
 */
const withCustomPostTypesSetting = (
	settings: WpBlockType<any>['settings'],
	name: string
) => {
	if (name !== block.slug) {
		return settings;
	}

	settings['postTypes'] = ['post'];

	return settings;
};
export const ListEditBlockSettings: WpFilterType = {
	hook: 'blocks.registerBlockType',
	namespace: 'supt/list-edit-setting',
	callback: withCustomPostTypesSetting,
};

export const ListBlock = {
	slug: block.slug,
};
