import { InspectorAdvancedControls, RichText } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { TextControl } from '@wordpress/components';
import { _x } from '@wordpress/i18n';

import { IdControl } from '#/components';
import { WpBlockType } from '@/typings';
import block from './block.json';
import { CheckboxProps } from '.';

// styles
import './styles.css';

/**
 * COMPONENT EDITOR
 */
const Edit = (props: BlockEditProps<CheckboxProps>) => {
	const { name, label, id, value } = props.attributes;

	return (
		<>
			{/* Settings Sidebar */}
			<InspectorAdvancedControls>
				<TextControl
					label={_x('Value', 'Value', 'supt')}
					placeholder={label}
					value={value || ''}
					onChange={(value: string) => props.setAttributes({ value })}
					help={_x(
						'This is what will show in the form results if the checkbox is checked.',
						'Checkbox',
						'supt'
					)}
				/>
				<IdControl
					blockId={props.clientId.split('-')[0]}
					id={id || ''}
					name={name}
					label={label}
					onChange={(id) => props.setAttributes({ id })}
				/>
			</InspectorAdvancedControls>

			{/* Block Editor */}

			<div className="supt-checkbox">
				<input type="checkbox" className="supt-checkbox__input" />
				<RichText
					className="supt-checkbox__label"
					tagName="span"
					placeholder={_x('Label', 'Label', 'supt')}
					value={label}
					onChange={(label: string) => props.setAttributes({ label })}
					multiline={false}
					allowedFormats={[]}
				/>
			</div>
		</>
	);
};

/**
 * WORDPRESS BLOCK
 */
export const CheckboxBlock: WpBlockType<CheckboxProps> = {
	slug: block.slug,
	settings: {
		title: block.title,
		parent: ['supt/input-checkbox'],
		description: _x('', 'Block Checkbox', 'supt'),
		category: 'spck-form',
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="40"
				height="25"
				viewBox="0 0 40 25"
			>
				<g transform="translate(12 4)">
					<path d="M14.9189189,16 L1.08108108,16 C0.49009009,16 0,15.5099099 0,14.9189189 L0,1.08108108 C0,0.49009009 0.49009009,0 1.08108108,0 L14.9189189,0 C15.5099099,0 16,0.49009009 16,1.08108108 L16,14.9189189 C16,15.5099099 15.5099099,16 14.9189189,16 Z M2.16216216,13.8378378 L13.8378378,13.8378378 L13.8378378,2.16216216 L2.16216216,2.16216216 L2.16216216,13.8378378 Z" />
					<path d="M7.53791241,11 C7.34627548,11 7.15463856,10.9314437 7.02196685,10.7943312 L4.22111953,8.18919296 C3.92629349,7.91496788 3.92629349,7.48991901 4.22111953,7.21569393 C4.51594556,6.94146885 4.97292591,6.94146885 5.26775195,7.21569393 L7.4789472,9.27238201 L11.6802182,4.26777435 C11.9308203,3.96612676 12.3878007,3.91128175 12.7121093,4.14437306 C13.0364179,4.37746438 13.0953831,4.80251325 12.844781,5.10416084 L8.12756447,10.7257749 C7.99489276,10.8765987 7.80325584,10.9725775 7.59687761,10.9862887 C7.56739501,11 7.55265371,11 7.53791241,11 Z" />
				</g>
			</svg>
		),
		attributes: {
			id: {
				type: 'string',
			},
			label: {
				type: 'string',
			},
			name: {
				type: 'string',
			},
			value: {
				type: 'string',
			},
		},
		edit: Edit,
		save: () => null,
	},
};
