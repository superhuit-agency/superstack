'use client';

import cx from 'classnames';
import { filesize } from 'filesize';
import {
	ChangeEvent,
	FC,
	MouseEvent,
	forwardRef,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { sprintf } from 'sprintf-js';

import {
	IconDelete,
	IconDocument,
	IconInvalid,
} from '@/components/icons/DocumentIcon';
import { useTranslation } from '@/hooks/use-translation';
import { BlockConfigs, InputProps } from '@/typings';

import block from './block.json';

// styles
import './styles.css';

/**
 * TYPINGS
 */
export type InputFileProps = InputProps & {
	description?: string;
	title?: string;
	nbFiles?: number;
	maxFilesize?: number;
	accept?: string;
};

/**
 * COMPONENT
 */
export const InputFile: FC<InputFileProps> & BlockConfigs = forwardRef(
	(
		{
			id,
			label: title,
			name,
			description,
			accept,
			nbFiles = 1,
			maxFilesize = 0,
			required,
			disabled,
			invalid,
			inputAttributes,
			onChange,
		},
		ref
	) => {
		const __t = useTranslation();

		const [files, setFiles] = useState<File[]>([]);

		const isInvalid = invalid && typeof invalid === 'string';
		const isMultiple = nbFiles > 1;
		const hasMaxFiles = files.length >= nbFiles;

		/**
		 * CALLBACKS
		 */
		const handleChange = useCallback(
			({ target }: ChangeEvent<HTMLInputElement>) => {
				const newFiles = isMultiple ? [...files] : [];

				if (target.files) {
					[...target.files].forEach((file) => {
						if (
							newFiles.findIndex(
								({ name }) => name === file.name
							) < 0
						)
							newFiles.push(file);
					});
				}

				if (newFiles.length > nbFiles) {
					newFiles.splice(nbFiles);
				}

				setFiles(newFiles);
			},
			[files, nbFiles, isMultiple]
		);

		const getFilesInfo = useCallback(
			(items: File[]) =>
				items.map(({ name, size }) => {
					const match = /(.*)\.(.+)$/.exec(name);
					if (match) {
						const [filename, basename, ext] = match;
						return {
							name: filename,
							basename,
							extension: ext.toUpperCase(),
							size: filesize(size, { round: 0 }),
						};
					}
					return null;
				}),
			[]
		);

		const handleClick = useCallback(
			(event: MouseEvent<HTMLInputElement>) => {
				const inputElement = event.target as HTMLInputElement;
				if (!isMultiple && files.length) {
					inputElement.value = '';

					setFiles([]);
					event.preventDefault();
				}
			},
			[files.length, isMultiple]
		);

		const handleRemove = useCallback(
			(index: number) => {
				const newFiles = [...files];
				newFiles.splice(index, 1);
				setFiles(newFiles);
			},
			[files]
		);

		/**
		 * MEMOS
		 */
		let label = useMemo(() => {
			if (isInvalid) {
				if (isMultiple) {
					return __t(
						'input-file-label-invalid-multi',
						'Add other files'
					);
				} else {
					return __t('input-file-label-invalid', 'Add another file');
				}
			} else if (hasMaxFiles) {
				return __t('input-file-label-max-files', 'Maximum reached');
			} else {
				return __t('input-file-label-add', 'Add a file');
			}
		}, [isInvalid, isMultiple, hasMaxFiles, __t]);

		const descr = useMemo(() => {
			if (description) return description;

			let _description = isMultiple
				? sprintf(
						// translators: %s is the maximum number of files
						__t('input-file-max-files', 'Maximum %s files.'),
						nbFiles
				  )
				: __t('input-file-max-one-file', '1 file only.');

			if (maxFilesize) {
				_description +=
					' ' +
					sprintf(
						isMultiple
							? // translators: %d is the maximum size of a file
							  __t(
									'input-file-multi-max-filesize',
									'Limited to %d MB per file.'
							  )
							: // translators: %d is the maximum size of a file
							  __t(
									'input-file-max-filesize',
									'Limited to %d MB.'
							  ),
						maxFilesize
					);
			}

			if (accept) {
				_description +=
					'<br/>' +
					sprintf(
						// translators: %s is the type of files accepted
						__t('input-file-accepts', 'Allowed types: %s.'),
						accept.split(',').join(', ')
					);
			}

			return _description;
		}, [description, isMultiple, nbFiles, maxFilesize, accept, __t]);

		const infoFiles = useMemo(
			() => getFilesInfo(files),
			[files, getFilesInfo]
		);

		/**
		 * USE EFFECTS
		 */
		useEffect(() => {
			// Clean state after invalid submission
			if (isInvalid) setFiles([]);
		}, [isInvalid]);

		useEffect(() => {
			onChange?.({ target: { value: files, name } });
		}, [files, name, onChange]);

		/**
		 * COMPONENT
		 */
		return (
			<div
				className={cx(
					'supt-input-file',
					'supt-input-wrapper',
					'supt-input-field',
					{
						'-error': isInvalid,
						'-disabled': disabled,
						'-has-max-files': hasMaxFiles,
					}
				)}
			>
				<div className="supt-input-file__inner">
					<div className="supt-input-file__title-wrap">
						<p
							className="supt-input-file__title supt-input-field__title"
							data-optional={
								isInvalid
									? undefined
									: required
									? ''
									: __t('form-input-optional', 'optional')
							}
						>
							{title}
						</p>
						{isInvalid ? <IconInvalid /> : <IconDocument />}
					</div>
					{!infoFiles.length || isInvalid ? (
						<p
							className="supt-input-file__description supt-input-field__description"
							dangerouslySetInnerHTML={{
								__html: isInvalid ? invalid : descr,
							}}
							role={isInvalid ? 'alert' : undefined}
						/>
					) : (
						<ul className="supt-input-file__list">
							{infoFiles.map((file, index) => (
								<li
									key={index}
									className="supt-input-file__file"
								>
									<button
										className="supt-input-file__file__delete"
										onClick={(e) => {
											e.preventDefault();
											handleRemove(index);
										}}
									>
										<span>
											{/* Translators: available variables for the file: `name`, `basename`, `extension`, `size` */}
											{sprintf(
												__t(
													'input-file-file-infos',
													'%(size)s – %(extension)s file – %(name)s'
												),
												file
											)}
										</span>
										<IconDelete />
									</button>
								</li>
							))}
						</ul>
					)}

					<div className="supt-input-file__label-wrapper supt-input-field__label-wrapper">
						<input
							type="file"
							id={id}
							className="supt-input-file__input supt-input-field__input"
							name={name}
							multiple={isMultiple}
							disabled={disabled}
							accept={
								accept && accept !== ''
									? accept
											.split(',')
											.map(
												(ext) =>
													ext.includes('/')
														? ext.trim()
														: `.${ext.replace(
																/^[\s\.]*|[\s\.]*$/,
																''
														  )}` // trim whitespaces & `.`
											)
											.join(',')
									: null
							}
							onClick={handleClick}
							onChange={handleChange}
							ref={ref}
							aria-invalid={!!invalid}
							{...inputAttributes}
						/>
						<label
							className={cx(
								'supt-input-file__label supt-input-field__label',
								{
									'supt-input-file__label--disabled':
										hasMaxFiles && !isInvalid,
								}
							)}
							htmlFor={id}
						>
							{label}
						</label>
					</div>
				</div>
			</div>
		);
	}
);

InputFile.displayName = 'InputFile';

InputFile.slug = block.slug;
InputFile.title = block.title;
