import { BlockEditProps } from '@wordpress/blocks';
import { _x } from '@wordpress/i18n';

import { ImageEdit } from '#/components';
import { ImageProps, WpBlockType } from '@/typings';

import block from './block.json';

/**
 * COMPONENT EDIT
 */
const Edit = (props: BlockEditProps<ImageProps>) => {
	return (
		<ImageEdit
			attributes={{
				...props.attributes,
				id: props.attributes.id || 0,
			}}
			hasCaption={true}
			isCover={true}
			isSelected={props.isSelected}
			onChange={(attributes: object) =>
				props.setAttributes({ ...attributes })
			}
		/>
	);
};

/**
 * WORDPRESS BLOCK
 */
export const ImageBlock: WpBlockType<ImageProps> = {
	slug: block.slug,
	settings: {
		title: block.title,
		description: _x('', 'Block description', 'supt'),
		icon: 'format-image',
		category: 'media',
		postTypes: ['post'],
		attributes: {
			id: {
				type: 'number',
			},
			src: {
				type: 'string',
			},
			alt: {
				type: 'string',
			},
			width: {
				type: 'number',
			},
			height: {
				type: 'number',
			},
			caption: {
				type: 'string',
			},
		},
		edit: Edit,
		save: () => null,
	},
};
