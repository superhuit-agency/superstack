import {
	InspectorAdvancedControls,
	InspectorControls,
	RichText,
} from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import {
	PanelBody,
	PanelRow,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { useRef } from '@wordpress/element';
import { _x, sprintf } from '@wordpress/i18n';

import { IdControl, NameControl } from '#/components';
import { IconDocument } from '@/components/icons/DocumentIcon';
import { WpBlockType } from '@/typings';
import block from './block.json';
import { InputFileProps } from '.';

// styles
import './styles.css';
import './styles.edit.css';

/**
 * COMPONENT EDITOR
 */
const Edit = (props: BlockEditProps<InputFileProps>) => {
	const {
		name,
		label,
		accept = '',
		nbFiles = 0,
		maxFilesize = 0,
		required,
		id = '',
		description,
	} = props.attributes;
	const refEl = useRef(null);
	const isMultiple = nbFiles > 1;

	let descPlaceholder = isMultiple
		? sprintf(
				// translators: %d is the maximum number of files
				_x('Maximum %d files.', 'input-file-max-files', 'supt'),
				nbFiles
			)
		: _x('1 file only.', 'input-file-max-one-file', 'supt');

	if (maxFilesize)
		descPlaceholder +=
			' ' +
			sprintf(
				_x(
					// translators: %d is the maximum size of a file
					'Limited to %d MB per file.',
					'input-file-max-filesize',
					'supt'
				),
				maxFilesize
			);
	if (accept)
		descPlaceholder +=
			'\n' +
			sprintf(
				// translators: %s is the type of files accepted
				_x('Allowed types: %s.', 'input-file-accepts', 'supt'),
				accept.split(',').join(', ')
			);

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
					<PanelRow>
						<TextControl
							label={_x('Accepted files', 'input-file', 'supt')}
							value={accept}
							help={_x(
								'Comma-separated list of allowed file extensions or MIME types.',
								'input-file',
								'supt'
							)}
							onChange={(accept: string) =>
								props.setAttributes({ accept })
							}
						/>
					</PanelRow>
					<PanelRow>
						<TextControl
							type="number"
							min={1}
							label={_x(
								'Max number of files',
								'input-file',
								'supt'
							)}
							help={
								nbFiles > 1
									? sprintf(
											// translators: %d is the number of files
											_x(
												'Up to %d files',
												'input-file',
												'supt'
											),
											nbFiles
										)
									: _x('Single file', 'input-file', 'supt')
							}
							value={nbFiles}
							onChange={(val: string) =>
								props.setAttributes({ nbFiles: parseInt(val) })
							}
						/>
					</PanelRow>
					<PanelRow>
						<TextControl
							type="number"
							min={2}
							label={_x('Max upload size', 'input-file', 'supt')}
							help={_x(
								'Maximum size of each file in MB',
								'input-file',
								'supt'
							)}
							placeholder={_x(
								'Not limited',
								'input-file',
								'supt'
							)}
							value={maxFilesize}
							onChange={(val: string) =>
								props.setAttributes({
									maxFilesize: parseInt(val),
								})
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
					onChange={(id) => props.setAttributes({ id })}
				/>
			</InspectorAdvancedControls>

			<div
				className="supt-input-file supt-input-wrapper supt-input-field"
				ref={refEl}
			>
				<div className="supt-input-file__inner">
					<div className="supt-input-file__icon">
						<IconDocument />
					</div>
					<div className="supt-input-file__info">
						<RichText
							className="supt-input-file__title supt-input-field__title"
							placeholder={_x(
								'Add a title',
								'Title Placeholder',
								'supt'
							)}
							value={label}
							onChange={(label: string) =>
								props.setAttributes({ label })
							}
							allowedFormats={[]}
						/>
						<RichText
							className="supt-input-file__description supt-input-field__description"
							tagName="p"
							placeholder={descPlaceholder}
							value={description}
							onChange={(description: string) =>
								props.setAttributes({ description })
							}
							allowedFormats={[]}
						/>
					</div>
					<div className="supt-input-file__label supt-input-field__label">
						{_x('Add a file', 'input-file', 'supt')}
					</div>
				</div>
			</div>
		</>
	);
};

/**
 * WORDPRESS BLOCK
 */
export const InputFileBlock: WpBlockType<InputFileProps> = {
	slug: block.slug,
	settings: {
		title: block.title,
		description: _x(
			'Input File block',
			'Block Input File description',
			'supt'
		),
		icon: 'media-document',
		category: 'spck-form',
		postTypes: ['form'],
		attributes: {
			id: { type: 'string' },
			label: { type: 'string' },
			name: { type: 'string' },
			description: { type: 'string' },
			nbFiles: { type: 'number', default: 1 },
			maxFilesize: { type: 'number' },
			required: { type: 'boolean', default: false },
			accept: { type: 'string', default: '' },
		},
		// keywords: [__('text'),	__('email'),	__('date')],
		supports: { customClassName: false },

		edit: Edit,
		save: () => null,
	},
};
