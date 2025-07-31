import { ComponentType } from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';
import domReady from '@wordpress/dom-ready';
import { unregisterFormatType } from '@wordpress/rich-text';
import { BlockEditProps } from '@wordpress/blocks';

// internal imports
import block from './block.json';

// styles
import './styles.css';

/**
 * Add custom className to core/paragraph block
 */
const withCustomClassName = createHigherOrderComponent(
	(BlockListBlock: ComponentType<any>) => {
		const EnhancedComponent = (props: BlockEditProps<any>) => {
			if ((props as any).name !== block.slug)
				return <BlockListBlock {...props} />;

			return <BlockListBlock {...props} className="supt-paragraph" />;
		};

		return EnhancedComponent;
	},
	'withCustomClassName'
);
export const ParagraphEditBlockClassName: WpFilterType = {
	hook: 'editor.BlockListBlock',
	namespace: 'supt/paragraph-edit-classname',
	callback: withCustomClassName,
};

/**
 * Add custom `postTypes` to core/paragraph block
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
export const ParagraphEditBlockSettings: WpFilterType = {
	hook: 'blocks.registerBlockType',
	namespace: 'supt/paragraph-edit-setting',
	callback: withCustomPostTypesSetting,
};

export const ParagraphBlock = {
	slug: block.slug,
};
