import { _x } from '@wordpress/i18n';

// block
import block from './block.json';

// styles
import './styles.css';
import './styles.edit.css';

/**
 * COMPONENT EDITOR
 */
const Edit = (props: WpBlockEditProps<LinkAttributes>) => {
	const { href, prefetch, scroll } = props.attributes;

	return (
		<div className="supt-link">
			<div className="supt-link__inner"></div>
		</div>
	);
};

/**
 * WORDPRESS BLOCK
 */
export const LinkBlock: WpBlockType<LinkAttributes> = {
	slug: block.slug,
	settings: {
		title: block.title,
		// parent: [],
		description: _x('', 'Block Link', 'supt'),
		category: '',
		icon: '',
		postTypes: ['page'],
		attributes: {
			isPreview: {
				type: 'boolean',
				default: false,
			},
			href: {
				type: 'string',
			},
			prefetch: {
				type: 'boolean',
			},
			scroll: {
				type: 'boolean',
			},
		},
		example: {
			attributes: {
				isPreview: true,
			},
		},
		edit: Edit,
		save: () => null,
	},
};
