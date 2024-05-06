import { BlockEditProps } from '@wordpress/blocks';
import { _x } from '@wordpress/i18n';

import { VideoEdit } from '#/components';
import { VideoProps, WpBlockType } from '@/typings';

import block from './block.json';

/**
 * COMPONENT EDITOR
 */
const Edit = (props: BlockEditProps<VideoProps>) => {
	return (
		<VideoEdit
			attributes={{ ...props.attributes }}
			onChange={(attributes: object) =>
				props.setAttributes({ ...attributes })
			}
		/>
	);
};

/**
 * WORDPRESS BLOCK
 */
export const VideoBlock: WpBlockType<VideoProps> = {
	slug: block.slug,
	settings: {
		title: block.title,
		description: _x('', 'Block description', 'supt'),
		icon: 'format-video',
		category: 'media',
		postTypes: ['post'],
		attributes: {
			id: {
				type: 'string',
			},
			source: {
				type: 'string',
			},
			poster: {
				type: 'object',
			},
			caption: {
				type: 'string',
			},
		},
		edit: Edit,
		save: () => null,
	},
};
