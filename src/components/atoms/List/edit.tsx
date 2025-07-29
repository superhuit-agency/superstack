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

			return (
				<BlockListBlock
					{...props}
					className="supt-list"
					style={{
						counterSet: props.attributes.start
							? `li ${props.attributes.start + 1}`
							: null,
					}}
				/>
			);
		};

		return EnhancedComponent;
	},
	'withCustomClassName'
);

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

	settings['postTypes'] = ['post', 'page'];

	return settings;
};

export const ListEditBlockClassName: WpFilterType = {
	hook: 'editor.BlockListBlock',
	namespace: 'supt/list',
	callback: withCustomClassName,
};

export const ListEditBlockSettings: WpFilterType = {
	hook: 'editor.BlockListBlock',
	namespace: 'supt/list',
	callback: withCustomPostTypesSetting,
};

export const ListBlock = {
	slug: block.slug,
};
