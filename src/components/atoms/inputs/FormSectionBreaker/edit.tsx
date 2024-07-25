import { RichText } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { _x } from '@wordpress/i18n';

import { FormSectionBreakerProps } from '.';
import block from './block.json';

// styles
import './styles.css';
import './styles.edit.css';

/**
 * COMPONENT EDITOR
 */
const Edit = (props: BlockEditProps<FormSectionBreakerProps>) => {
	const { title } = props.attributes;

	return (
		<div className="supt-form-section-breaker">
			<RichText
				className="supt-form-section-breaker__title"
				tagName="h2"
				placeholder={_x(
					'Add a section title',
					'Section Title Placeholder',
					'supt'
				)}
				value={title}
				onChange={(title: string) => props.setAttributes({ title })}
				allowedFormats={[]}
			/>
		</div>
	);
};

/**
 * WORDPRESS BLOCK
 */
export const FormSectionBreakerBlock: WpBlockType<FormSectionBreakerProps> = {
	slug: block.slug,
	settings: {
		title: block.title,
		description: _x(
			'Form Section Breaker',
			'Block FormSectionBreaker description',
			'supt'
		),
		icon: 'editor-textcolor',
		category: 'common',
		postTypes: ['form'],
		attributes: {
			title: {
				type: 'string',
			},
		},
		edit: Edit,
		save: () => null,
	},
};
