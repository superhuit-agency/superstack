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
import { WpBlockType } from '@/typings';
import block from './block.json';
import { InputTextareaProps } from '.';

// styles
import './styles.css';
import './styles.edit.css';

/**
 * COMPONENT EDITOR
 */
const Edit = (props: BlockEditProps<InputTextareaProps>) => {
	const { name, label, required, id = '', placeholder } = props.attributes;
	const refEl = useRef(null);

	return (
		<>
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
				className="supt-input-textarea supt-input-wrapper supt-input-field"
				ref={refEl}
			>
				{!required ? (
					<span className="supt-input-textarea__optional supt-input-field__optional">
						{_x('Optional', 'Optional', 'supt')}
					</span>
				) : null}
				<PlainText
					className="supt-input-textarea__label supt-input-field__label"
					placeholder={_x('Label', 'Label', 'supt')}
					value={label}
					onChange={(label: string) => props.setAttributes({ label })}
				/>
				<PlainText
					className="supt-input-textarea__input supt-input-field__input"
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
 * WORDPRESS BLOCK
 */
export const InputTextareaBlock: WpBlockType<InputTextareaProps> = {
	slug: block.slug,
	settings: {
		title: block.title,
		description: _x(
			'Multiline text input, for messages.',
			'Block Input Text description',
			'supt'
		),
		category: 'spck-form',
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="40"
				height="37"
				viewBox="0 0 40 37"
			>
				<g transform="translate(5 3)">
					<path d="M7.3765586,11 L3.6234414,11 C3.27431421,11 3,10.78 3,10.5 C3,10.22 3.27431421,10 3.6234414,10 L7.3765586,10 C7.72568579,10 8,10.22 8,10.5 C8,10.78 7.72568579,11 7.3765586,11 Z" />
					<path d="M29.0425532,30 L0.957446809,30 C0.434042553,30 0,29.5802469 0,29.0740741 L0,0.925925926 C0,0.419753086 0.434042553,0 0.957446809,0 L29.0425532,0 C29.5659574,0 30,0.419753086 30,0.925925926 L30,29.0740741 C30,29.5802469 29.5659574,30 29.0425532,30 Z M1.91489362,28.1481481 L28.0851064,28.1481481 L28.0851064,1.85185185 L1.91489362,1.85185185 L1.91489362,28.1481481 Z" />
					<path d="M12.5,11 C12.22,11 12,10.7038462 12,10.3269231 L12,4.67307692 C12,4.29615385 12.22,4 12.5,4 C12.78,4 13,4.29615385 13,4.67307692 L13,10.3269231 C13,10.7038462 12.77,11 12.5,11 Z" />
					<path d="M14.3765586 5L10.6234414 5C10.2743142 5 10 4.78 10 4.5 10 4.22 10.2743142 4 10.6234414 4L14.3765586 4C14.7256858 4 15 4.22 15 4.5 15 4.78 14.7256858 5 14.3765586 5zM14.3765586 11L10.6234414 11C10.2743142 11 10 10.78 10 10.5 10 10.22 10.2743142 10 10.6234414 10L14.3765586 10C14.7256858 10 15 10.22 15 10.5 15 10.78 14.7256858 11 14.3765586 11z" />
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
					blocks: ['supt/input-text'],
					transform: (attributes: object) => {
						return createBlock('supt/input-text', attributes);
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
