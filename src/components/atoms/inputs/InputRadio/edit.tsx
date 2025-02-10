import {
	InnerBlocks,
	InspectorAdvancedControls,
	InspectorControls,
	PlainText,
} from '@wordpress/block-editor';
import { PanelBody, PanelRow, ToggleControl } from '@wordpress/components';
import { useRef } from '@wordpress/element';
import { _x } from '@wordpress/i18n';

import { IdControl, NameControl } from '#/components';
import { RadioBlock } from '../Radio/edit';

import block from './block.json';

// styles
import './styles.css';
import './styles.edit.css';

/**
 * COMPONENT EDITOR
 */
const Edit = (props: WpBlockEditProps<InputRadioAttributes>) => {
	const refEl = useRef(null);

	const { id = '', label, name, required } = props.attributes;

	return (
		<>
			{/* Settings Sidebar */}
			<InspectorControls>
				<PanelBody title={_x('Settings', 'Settings', 'supt')}>
					<PanelRow>
						<ToggleControl
							label={_x('Required ?', 'Required ?', 'supt')}
							checked={required}
							onChange={(required: boolean) =>
								props.setAttributes({ required })
							}
						/>
					</PanelRow>
					<PanelRow>
						<NameControl
							name={name}
							placeholder={label}
							onChange={(name: string) =>
								props.setAttributes({ name })
							}
						/>
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			<InspectorAdvancedControls>
				<IdControl
					blockId={props.clientId.split('-')[0]}
					id={id}
					name={name}
					label={label}
					onChange={(id: string) => props.setAttributes({ id })}
				/>
			</InspectorAdvancedControls>

			{/* Block Editor */}
			<fieldset
				className="supt-input-radio supt-input-wrapper supt-input-field"
				ref={refEl}
			>
				{!required ? (
					<span className="supt-input-radio__optional supt-input-field__optional">
						{_x('Optional', 'Optional', 'supt')}
					</span>
				) : null}
				<PlainText
					className="supt-input-radio__label supt-input-field__label"
					placeholder={_x('Label', 'Label', 'supt')}
					value={label}
					onChange={(label: string) => props.setAttributes({ label })}
					multiline="false"
				/>
				<div className="supt-input-radio__wrapper">
					<InnerBlocks
						allowedBlocks={[RadioBlock.slug]}
						template={[[RadioBlock.slug], [RadioBlock.slug]]}
						templateLock={false}
					/>
				</div>
			</fieldset>
		</>
	);
};

/**
 * WORDPRESS BLOCK
 */
export const InputRadioBlock: WpBlockType<InputRadioAttributes> = {
	slug: block.slug,
	settings: {
		title: block.title,
		description: _x(
			'Input Radio block',
			'Block Input Radio description',
			'supt'
		),
		category: 'spck-form',
		icon: (
			<svg
				width="20"
				height="20"
				viewBox="0 0 48 48"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g fill="none" fillRule="evenodd">
					<circle
						stroke="#000"
						strokeWidth="4"
						cx="23.5"
						cy="23.5"
						r="14.5"
					/>
					<g transform="translate(7 7)">
						<circle
							stroke="#000"
							strokeWidth="4"
							cx="16.5"
							cy="16.5"
							r="14.5"
						/>
						<circle fill="#000" cx="16.5" cy="16.5" r="8.5" />
					</g>
				</g>
			</svg>
		),
		postTypes: ['form'],
		attributes: {
			id: {
				type: 'string',
				default: '',
			},
			label: {
				type: 'string',
			},
			name: {
				type: 'string',
				default: '',
			},
			required: {
				type: 'boolean',
				default: false,
			},
		},
		edit: Edit,
		save: () => <InnerBlocks.Content />,
	},
};
