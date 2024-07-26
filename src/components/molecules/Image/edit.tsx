import { BlockEditProps } from '@wordpress/blocks';
import { _x } from '@wordpress/i18n';

import { ImageEdit } from '#/components';

import block from './block.json';

/**
 * COMPONENT EDIT
 */
const Edit = (props: BlockEditProps<ImageAttributes>) => {
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
export const ImageBlock: WpBlockType<ImageAttributes> = {
	slug: block.slug,
	settings: {
		title: block.title,
		description: _x('', 'Block description', 'supt'),
		icon: 'format-image',
		category: 'media',
		postTypes: ['post'],
		attributes: {
			alt: { type: 'string' },
			caption: { type: 'string' },
			height: { type: 'number' },
			id: { type: 'number' },
			src: { type: 'string' },
			width: { type: 'number' },
		},
		edit: Edit,
		save: () => null,
	},
};
