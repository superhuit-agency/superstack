import {
	InspectorAdvancedControls,
	InspectorControls,
	PlainText,
} from '@wordpress/block-editor';
import { BlockEditProps, createBlock } from '@wordpress/blocks';
import { PanelBody, PanelRow, ToggleControl } from '@wordpress/components';
import { useRef } from '@wordpress/element';
import { _x } from '@wordpress/i18n';

import { IdControl, NameControl } from '#/components';

import block from './block.json';
import { InputTextProps } from '.';

// styles
import './styles.css';
import './styles.edit.css';

/**
 * COMPONENT EDITOR
 */
const Edit = (props: BlockEditProps<InputTextProps>) => {
	const { name, label, required, id = '', placeholder } = props.attributes;
	const refEl = useRef(null);

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
							onChange={(name) => props.setAttributes({ name })}
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
					onChange={(id) => props.setAttributes({ id })}
				/>
			</InspectorAdvancedControls>

			<div
				className="supt-input-text supt-input-wrapper supt-input-field"
				ref={refEl}
			>
				{!required ? (
					<span className="supt-input-text__optional supt-input-field__optional">
						{_x('Optional', 'Optional', 'supt')}
					</span>
				) : null}
				<PlainText
					className="supt-input-text__label supt-input-field__label"
					placeholder={_x('Label', 'Label', 'supt')}
					value={label}
					onChange={(label: string) => props.setAttributes({ label })}
				/>
				<PlainText
					className="supt-input-text__input supt-input-field__input"
					placeholder={_x('Add a placeholder', 'Placeholder', 'supt')}
					value={placeholder}
					onChange={(placeholder: string) =>
						props.setAttributes({ placeholder })
					}
				/>
			</div>
		</>
	);
};

/**
 * WORDPRESS COMPONENTS
 */
export const InputTextBlock: WpBlockType<InputTextProps> = {
	slug: block.slug,
	settings: {
		title: block.title,
		description: _x(
			'Input Text block',
			'Block Input Text description',
			'supt'
		),
		category: 'spck-form',
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="40"
				height="25"
				viewBox="0 0 40 25"
			>
				<g transform="translate(1 2)">
					<path d="M36.6306306,20 L1.36936937,20 C0.667567568,20 0.0855855856,19.4333333 0.0855855856,18.75 L0.0855855856,1.25 C0.0855855856,0.566666667 0.667567568,0 1.36936937,0 L36.6306306,0 C37.3324324,0 37.9144144,0.566666667 37.9144144,1.25 L37.9144144,18.75 C37.9144144,19.4333333 37.3324324,20 36.6306306,20 Z M2.65315315,17.5 L35.3468468,17.5 L35.3468468,2.5 L2.65315315,2.5 L2.65315315,17.5 Z" />
					<path d="M10.9036036 14.5833333L5.75135135 14.5833333C5.27207207 14.5833333 4.8954955 14.2166667 4.8954955 13.75 4.8954955 13.2833333 5.27207207 12.9166667 5.75135135 12.9166667L10.9036036 12.9166667C11.3828829 12.9166667 11.7594595 13.2833333 11.7594595 13.75 11.7594595 14.2166667 11.3828829 14.5833333 10.9036036 14.5833333zM17.7504505 14.25C17.2711712 14.25 16.8945946 13.8833333 16.8945946 13.4166667L16.8945946 6.41666667C16.8945946 5.95 17.2711712 5.58333333 17.7504505 5.58333333 18.2297297 5.58333333 18.6063063 5.95 18.6063063 6.41666667L18.6063063 13.4166667C18.6063063 13.8833333 18.2126126 14.25 17.7504505 14.25z" />
					<path d="M20.318018 6.75L15.1657658 6.75C14.6864865 6.75 14.3099099 6.38333333 14.3099099 5.91666667 14.3099099 5.45 14.6864865 5.08333333 15.1657658 5.08333333L20.318018 5.08333333C20.7972973 5.08333333 21.1738739 5.45 21.1738739 5.91666667 21.1738739 6.38333333 20.7972973 6.75 20.318018 6.75zM20.318018 14.5833333L15.1657658 14.5833333C14.6864865 14.5833333 14.3099099 14.2166667 14.3099099 13.75 14.3099099 13.2833333 14.6864865 12.9166667 15.1657658 12.9166667L20.318018 12.9166667C20.7972973 12.9166667 21.1738739 13.2833333 21.1738739 13.75 21.1738739 14.2166667 20.7972973 14.5833333 20.318018 14.5833333z" />
				</g>
			</svg>
		),
		postTypes: ['form'],
		transforms: {
			to: [
				{
					type: 'block',
					blocks: ['supt/input-email'],
					transform: (attributes: object) => {
						return createBlock('supt/input-email', attributes);
					},
				},
				{
					type: 'block',
					blocks: ['supt/input-textarea'],
					transform: (attributes: object) => {
						return createBlock('supt/input-textarea', attributes);
					},
				},
			],
		},
		attributes: {
			id: { type: 'string' },
			label: { type: 'string' },
			name: { type: 'string' },
			placeholder: { type: 'string' },
			required: { type: 'boolean', default: false },
		},
		// keywords: [__('text'),	__('email'),	__('date')],
		supports: { customClassName: false },

		edit: Edit,
		save: () => null,
	},
};
