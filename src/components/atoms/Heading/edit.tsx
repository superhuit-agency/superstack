import { ComponentType, useLayoutEffect, useState } from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';
import { BlockEditProps, getBlockType } from '@wordpress/blocks';
import { BlockControls } from '@wordpress/block-editor';
import { select } from '@wordpress/data';
import { ToolbarDropdownMenu } from '@wordpress/components';

// internal imports
import { H1Icon } from '#/assets/icons/Heading/H1';
import { H2Icon } from '#/assets/icons/Heading/H2';
import { H3Icon } from '#/assets/icons/Heading/H3';
import { H4Icon } from '#/assets/icons/Heading/H4';
import { H5Icon } from '#/assets/icons/Heading/H5';
import { H6Icon } from '#/assets/icons/Heading/H6';

import { WpBlockType, WpFilterType } from '@/typings';

import block from './block.json';

// styles
import './styles.css';
import './styles.edit.css';

/**
 * Add custom className to core/heading block
 */
const withCustomClassName = createHigherOrderComponent((BlockListBlock) => {
	const EnhancedComponent = (
		props: BlockEditProps<Record<string, unknown>>
	) => {
		const isValidProps = (props: unknown): props is { name: string } => {
			return (
				typeof props === 'object' && props !== null && 'name' in props
			);
		};

		if (!isValidProps(props)) return <BlockListBlock {...props} />;

		if (props.name !== block.slug) return <BlockListBlock {...props} />;

		return <BlockListBlock {...props} className="supt-heading" />;
	};

	return EnhancedComponent;
}, 'withCustomClassName');
export const HeadingEditBlockClassName: WpFilterType = {
	hook: 'editor.BlockListBlock',
	namespace: 'supt/heading-edit-classname',
	callback: withCustomClassName,
};

/**
 * Add custom `postTypes` to core/heading block
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
export const HeadingEditBlockSettings: WpFilterType = {
	hook: 'blocks.registerBlockType',
	namespace: 'supt/heading-edit-setting',
	callback: withCustomPostTypesSetting,
};

/**
 * Add a custom heading level dropdown to core/heading edit block
 */

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6];

const HEADING_ICONS = {
	1: H1Icon,
	2: H2Icon,
	3: H3Icon,
	4: H4Icon,
	5: H5Icon,
	6: H6Icon,
};

const editHeadingBlockEdit = createHigherOrderComponent(
	(BlockEdit: ComponentType<any>) => {
		const EnhancedComponent = (props: BlockEditProps<any>) => {
			const [allowedLevels, setAllowedLevels] = useState(HEADING_LEVELS);

			useLayoutEffect(() => {
				if ((props as any).name !== 'core/heading' || !props.isSelected)
					return;

				// Check if the block has parent
				// @ts-ignore
				const parentBlock = select('core/block-editor').getBlockParents(
					props.clientId
				);

				if (!parentBlock || parentBlock.length === 0) return;

				const firstParentBlock = select('core/block-editor').getBlock(
					parentBlock[0]
				);

				if (!firstParentBlock) return;

				// Get the template value in the parent for the heading
				const blockType = getBlockType(firstParentBlock?.name) as any;

				const level = blockType?.innerBlocksHeadingAvailableLevels[0];

				const availableLevels =
					blockType?.innerBlocksHeadingAvailableLevels?.map(
						(currLevel: number) => currLevel
					) || HEADING_LEVELS;

				setAllowedLevels(
					availableLevels.sort((a: number, b: number) => a - b)
				);

				if (
					(level || availableLevels.length > 0) &&
					!availableLevels.includes(props.attributes.level)
				) {
					props.setAttributes({
						level: level || availableLevels[0],
					});
				}
			}, [props]);

			if ((props as any).name !== block.slug)
				return <BlockEdit {...props} />;

			return (
				<>
					{allowedLevels.length !== HEADING_LEVELS.length && (
						<BlockControls group="block">
							<ToolbarDropdownMenu
								className="supt-heading-level-dropdown"
								icon={
									HEADING_ICONS[
										props.attributes
											.level as unknown as keyof typeof HEADING_ICONS
									]
								}
								label="Change Heading Level"
								controls={allowedLevels.map((level) => ({
									icon: HEADING_ICONS[
										level as unknown as keyof typeof HEADING_ICONS
									],
									ariaLabel: `Heading ${level}`,
									isActive: props.attributes.level === level,
									onClick: () =>
										props.setAttributes({ level }),
								}))}
							/>
						</BlockControls>
					)}
					<BlockEdit key="edit" {...props} />
				</>
			);
		};

		return EnhancedComponent;
	},
	'editHeadingBlockEdit'
);

export const HeadingEditBlock: WpFilterType = {
	hook: 'editor.BlockEdit',
	namespace: 'supt/heading-with-custom-edit',
	callback: editHeadingBlockEdit,
};

export const HeadingBlock = {
	slug: block.slug,
};
