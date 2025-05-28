import { BlockEditProps } from '@wordpress/blocks';
import { _x } from '@wordpress/i18n';
import cx from 'classnames';

import { ButtonEdit } from '#/components';

import block from './block.json';

// styles
import './styles.css';
import './styles.edit.css';

/**
 * COMPONENT EDITOR
 */
const Edit = (props: BlockEditProps<ButtonAttributes>) => {
	const { variant } = props.attributes;

	return (
		<ButtonEdit
			attrs={props.attributes}
			onChange={(attrs: ButtonProps) => props.setAttributes(attrs)}
			isSelected={props.isSelected}
			placeholder={_x('Discover', 'Button Placeholder', 'supt')}
			toolbarPosition="right"
			rootClass={cx('supt-button', `-${variant}`)}
		/>
	);
};

/**
 * WORDPRESS BLOCK
 */
export const ButtonBlock: WpBlockType<ButtonAttributes> = {
	slug: block.slug,
	settings: {
		title: block.title,
		description: _x('', 'Block description', 'supt'),
		icon: 'button',
		category: 'text',
		postTypes: ['post', 'page'],
		attributes: {
			href: {
				type: 'string',
			},
			target: {
				type: 'string',
			},
			title: {
				type: 'string',
			},
			variant: {
				type: 'string',
				default: 'primary',
			},
		},
		edit: Edit,
		save: () => null,
	},
};
