import React, { useCallback } from 'react';
import cx from 'classnames';
import { _x, sprintf } from '@wordpress/i18n';
import { useMemo, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { isBlobURL } from '@wordpress/blob';
import { Button, DropZone, Spinner } from '@wordpress/components';
import {
	MediaUpload,
	MediaUploadCheck,
	RichText,
} from '@wordpress/block-editor';

import { CoreBlockEditorSelector } from '#/typings';
import { ImageProps } from '@/typings';

// styles
import './styles.css';

/**
 * TYPINGS
 */
type ImageEditProps = {
	attributes: ImageProps & { id: number };
	isSelected: boolean;
	onChange: Function;
	hasCaption?: boolean;
	isCover?: boolean;
	canDelete?: boolean;
	ratioWidth?: number;
	ratioHeight?: number;
	className?: string;
};

type MediaUpload = any;

/**
 * COMPONENT
 */
const ImageEdit = ({
	attributes,
	isSelected,
	onChange,
	hasCaption,
	isCover,
	canDelete = true,
	ratioWidth,
	ratioHeight,
	className,
}: ImageEditProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [onMouseOver, setOnMouseOver] = useState(false);

	const { id, src, alt, caption } = attributes ?? {};

	const showEditBtn = useMemo(
		() => onMouseOver && isSelected,
		[onMouseOver, isSelected]
	);

	const showDeleteBtn = useMemo(
		() => onMouseOver && canDelete && isSelected,
		[onMouseOver, canDelete, isSelected]
	);

	// Upload on drop file
	const mediaUpload = useSelect((select: Function) => {
		const { getSettings } = select(
			'core/block-editor'
		) as CoreBlockEditorSelector;
		return getSettings().mediaUpload;
	}, []);

	const onDropFiles = useCallback(
		(filesList: FileList) => {
			mediaUpload({
				allowedTypes: ['image'],
				filesList,
				onFileChange([media]: MediaUpload[]) {
					if (isBlobURL(media?.url)) {
						setIsLoading(true);
						return;
					}
					onChange({
						id: media.id,
						src: media.url,
						alt: media.alt,
						width: media.width,
						height: media.height,
						caption: media.caption,
					});
					setIsLoading(false);
				},
			});
		},
		[mediaUpload, onChange]
	);

	const onRemoveImage = useCallback(() => {
		onChange({
			id: null,
			src: '',
			alt: '',
			width: 0,
			height: 0,
			caption: '',
		});
	}, [onChange]);

	return (
		<figure
			className={cx('supt-image-edit', className)}
			onMouseOver={() => setOnMouseOver(true)}
			onMouseLeave={() => setOnMouseOver(false)}
		>
			<MediaUploadCheck>
				<MediaUpload
					onSelect={(media: MediaUpload) => {
						onChange({
							id: media.id,
							src: media.url,
							alt: media.alt,
							width: media.width,
							height: media.height,
							caption: media.caption,
						});
					}}
					value={id}
					allowedTypes={['image']}
					render={
						(({ open }: { open: boolean }) => (
							<div
								className={cx(
									'supt-image-edit__image supt-figure__image',
									!src
										? 'editor-post-featured-image__toggle'
										: 'editor-post-featured-image__preview'
								)}
								style={{
									aspectRatio:
										ratioWidth && ratioHeight
											? `${ratioWidth}/${ratioHeight}`
											: 'initial',
								}}
							>
								{!!src ? (
									<>
										<picture>
											<img
												src={src as string}
												alt={alt}
												className={cx(
													'supt-image-edit__image-preview',
													{
														'-is-cover': isCover,
													}
												)}
											/>
										</picture>
										<div className="supt-image-edit__actions">
											{showEditBtn && (
												<Button
													className="editor-block-right-menu__control"
													onClick={open as any}
													icon="edit"
													label={_x(
														'Edit/Change image',
														'Image edit',
														'supt'
													)}
												/>
											)}
											{showDeleteBtn && (
												<Button
													className="editor-block-right-menu__control"
													onClick={onRemoveImage}
													icon="trash"
													label={_x(
														'Remove image',
														'Image edit',
														'supt'
													)}
												/>
											)}
										</div>
									</>
								) : (
									<>
										<Button
											onClick={open as any}
											className={cx(
												'supt-image-edit__btn',
												!src
													? 'editor-post-featured-image__toggle'
													: 'editor-post-featured-image__preview'
											)}
										>
											{isLoading ? (
												<Spinner />
											) : (
												<span>
													{ratioWidth && ratioHeight
														? sprintf(
																// translators: %1$d: width, %2$d: height
																_x(
																	'Image ratio: %1$dx%2$d',
																	'Image edit',
																	'supt'
																),
																ratioWidth,
																ratioHeight
															)
														: _x(
																'Select an image',
																'Image edit',
																'supt'
															)}
												</span>
											)}
										</Button>
										<DropZone
											onFilesDrop={onDropFiles as any}
										/>
									</>
								)}
							</div>
						)) as any
					}
				/>
			</MediaUploadCheck>
			{hasCaption && !!src && (
				<RichText
					className="supt-image-edit__figcaption supt-figure__figcaption"
					tagName="figcaption"
					placeholder={_x('Add a caption', 'Image edit', 'supt')}
					value={caption as any}
					onChange={(caption: string) => onChange({ caption })}
					allowedFormats={[]}
				/>
			)}
		</figure>
	);
};

export default ImageEdit;
