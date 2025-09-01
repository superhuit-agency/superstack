import { ComponentType } from 'react';
import domReady from '@wordpress/dom-ready';
import { createHigherOrderComponent } from '@wordpress/compose';
import {
	BlockEditProps,
	registerBlockStyle,
	unregisterBlockStyle,
} from '@wordpress/blocks';

// internal imports
import block from './block.json';

// styles
import './styles.edit.css';
import './styles.css';

/**
 * Add custom className to core/button block
 */
const withCustomClassName = createHigherOrderComponent(
	(BlockListBlock: ComponentType<any>) => {
		const EnhancedComponent = (props: BlockEditProps<any>) => {
			if ((props as any).name !== block.slug)
				return <BlockListBlock {...props} />;

			return <BlockListBlock {...props} className="supt-button" />;
		};

		return EnhancedComponent;
	},
	'withCustomClassName'
);
export const ButtonEditBlockClassName: WpFilterType = {
	hook: 'editor.BlockListBlock',
	namespace: 'supt/button-edit-classname',
	callback: withCustomClassName,
};

/**
 * Add custom className to core/button inner block (which is the button itself)
 */
const withCustomInnerClassName = createHigherOrderComponent(
	(BlockEdit: ComponentType<any>) => {
		const EnhancedComponent = (props: BlockEditProps<any>) => {
			if ((props as any).name !== block.slug)
				return <BlockEdit {...props} />;

			return <BlockEdit {...props} className="supt-button__inner" />;
		};

		return EnhancedComponent;
	},
	'withCustomInnerClassName'
);
export const ButtonEditBlockInnerClassName: WpFilterType = {
	hook: 'editor.BlockEdit',
	namespace: 'supt/button-edit-inner-classname',
	callback: withCustomInnerClassName,
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

	return settings;
};
export const ButtonEditBlockSettings: WpFilterType = {
	hook: 'blocks.registerBlockType',
	namespace: 'supt/button-edit-setting',
	callback: withCustomPostTypesSetting,
};

// Unregister default button styles to register custom styles (primary + secondary variants)
domReady(() => {
	unregisterBlockStyle('core/button', 'fill');
	unregisterBlockStyle('core/button', 'outline');
	registerBlockStyle('core/button', {
		name: 'primary',
		label: 'Primary',
		isDefault: true,
	});
	registerBlockStyle('core/button', {
		name: 'secondary',
		label: 'Secondary',
	});
});

export const ButtonBlock = {
	slug: block.slug,
};
