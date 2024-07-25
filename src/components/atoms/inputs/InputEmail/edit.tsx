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
import { InputEmailProps } from '.';

// styles
import './styles.css';
import './styles.edit.css';

/**
 * COMPONENT EDITOR
 */
const Edit = (props: BlockEditProps<InputEmailProps>) => {
	const { name, label, required, id, placeholder } = props.attributes;
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
					id={id || ''}
					name={name}
					label={label}
					onChange={(id) => props.setAttributes({ id })}
				/>
			</InspectorAdvancedControls>

			<div
				className="supt-input-email supt-input-wrapper supt-input-field"
				ref={refEl}
			>
				{!required ? (
					<span className="supt-input-field__optional supt-input-email__optional">
						{_x('Optional', 'Optional', 'supt')}
					</span>
				) : null}
				<PlainText
					className="supt-input-email__label supt-input-field__label"
					placeholder={_x('Label', 'Label', 'supt')}
					value={label}
					onChange={(label: string) => props.setAttributes({ label })}
				/>
				<PlainText
					className="supt-input-email__input supt-input-field__input"
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
export const InputEmailBlock: WpBlockType<InputEmailProps> = {
	slug: block.slug,
	settings: {
		title: block.title,
		description: _x(
			'Simple email input.',
			'Block Input Email description',
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
					<path d="M33.1666667,14 L24.8333333,14 C24.3666667,14 24,13.6255319 24,13.1489362 L24,6.85106383 C24,6.37446809 24.3666667,6 24.8333333,6 L33.1666667,6 C33.6333333,6 34,6.37446809 34,6.85106383 L34,13.1489362 C34,13.6255319 33.6333333,14 33.1666667,14 Z M25.6666667,12.2978723 L32.3333333,12.2978723 L32.3333333,7.70212766 L25.6666667,7.70212766 L25.6666667,12.2978723 Z" />
					<path d="M28.9857611,11 C28.801432,11 28.63386,10.9480123 28.4830452,10.8267075 L24.3272602,7.5514795 C23.9586019,7.25688227 23.8915731,6.71967556 24.1764454,6.33843209 C24.4613178,5.95718862 24.9807909,5.88787162 25.3494493,6.18246885 L29.0025183,9.05912414 L32.6555874,6.18246885 C33.0242457,5.88787162 33.5437189,5.97451787 33.8285912,6.33843209 C34.1134636,6.71967556 34.0296776,7.25688227 33.6777765,7.5514795 L29.5219915,10.8267075 C29.3376623,10.930683 29.1700903,11 28.9857611,11 Z" />
					<path d="M36.7104072,20 L1.28959276,20 C0.584615385,20 0,19.4333333 0,18.75 L0,1.25 C0,0.566666667 0.584615385,0 1.28959276,0 L36.7104072,0 C37.4153846,0 38,0.566666667 38,1.25 L38,18.75 C38,19.4333333 37.4153846,20 36.7104072,20 Z M2.57918552,17.5 L35.4208145,17.5 L35.4208145,2.5 L2.57918552,2.5 L2.57918552,17.5 Z" />
					<path d="M11.127182 15L5.87281796 15C5.3840399 15 5 14.56 5 14 5 13.44 5.3840399 13 5.87281796 13L11.127182 13C11.6159601 13 12 13.44 12 14 12 14.56 11.6159601 15 11.127182 15zM18 15C17.44 15 17 14.6192308 17 14.1346154L17 6.86538462C17 6.38076923 17.44 6 18 6 18.56 6 19 6.38076923 19 6.86538462L19 14.1346154C19 14.6192308 18.54 15 18 15z" />
					<path d="M20.127182 7L14.872818 7C14.3840399 7 14 6.56 14 6 14 5.44 14.3840399 5 14.872818 5L20.127182 5C20.6159601 5 21 5.44 21 6 21 6.56 20.6159601 7 20.127182 7zM20.127182 15L14.872818 15C14.3840399 15 14 14.56 14 14 14 13.44 14.3840399 13 14.872818 13L20.127182 13C20.6159601 13 21 13.44 21 14 21 14.56 20.6159601 15 20.127182 15z" />
				</g>
			</svg>
		),
		postTypes: ['form'],
		transforms: {
			to: [
				{
					type: 'block',
					blocks: ['supt/input-text'],
					transform: (attributes: object) => {
						return createBlock('supt/input-text', attributes);
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
		// keywords: [__('email'),	__('email'),	__('date')],
		supports: { customClassName: false },

		edit: Edit,
		save: () => null,
	},
};
