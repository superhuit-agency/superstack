import { BlockEditProps } from '@wordpress/blocks';
import { _x } from '@wordpress/i18n';

import { VideoEdit } from '#/components';

import block from './block.json';

/**
 * COMPONENT EDITOR
 */
const Edit = (props: BlockEditProps<VideoAttributes>) => {
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
export const VideoBlock: WpBlockType<VideoAttributes> = {
	slug: block.slug,
	settings: {
		title: block.title,
		description: _x('', 'Block description', 'supt'),
		icon: 'format-video',
		category: 'media',
		postTypes: ['post'],
		attributes: {
			caption: { type: 'string' },
			id: { type: 'string' },
			poster: { type: 'object' },
			source: { type: 'string' },
		},
		edit: Edit,
		save: () => null,
	},
};
