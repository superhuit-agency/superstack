import { ComponentType } from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';
import { BlockEditProps } from '@wordpress/blocks';

// internal imports
import block from './block.json';

// styles
import './styles.css';

/**
 * Add custom className to core/button block
 */
const withCustomClassName = createHigherOrderComponent(
	(BlockListBlock: ComponentType<any>) => {
		const EnhancedComponent = (props: BlockEditProps<any>) => {
			if ((props as any).name !== block.slug)
				return <BlockListBlock {...props} />;

			return <BlockListBlock {...props} className="supt-buttons" />;
		};

		return EnhancedComponent;
	},
	'withCustomClassName'
);
export const ButtonsEditBlockClassName: WpFilterType = {
	hook: 'editor.BlockListBlock',
	namespace: 'supt/buttons-edit-classname',
	callback: withCustomClassName,
};

/**
 * Add custom `postTypes` to core/button block
 */
const withCustomPostTypesSetting = (
	settings: WpBlockType<any>['settings'],
	name: string
) => {
	if (name !== block.slug) {
		return settings;
	}

	settings['postTypes'] = ['post', 'page'];

	// Remove layout controls in sidebar
	// @ts-expect-error
	settings.supports = {
		...settings.supports,
		align: false,
		layout: false,
	};

	return settings;
};
export const ButtonsEditBlockSettings: WpFilterType = {
	hook: 'blocks.registerBlockType',
	namespace: 'supt/buttons-edit-setting',
	callback: withCustomPostTypesSetting,
};

export const ButtonsBlock = {
	slug: block.slug,
};
