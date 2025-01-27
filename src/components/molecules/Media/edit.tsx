import { useCallback } from 'react';
import cx from 'classnames';
import {
	BlockControls,
	InspectorControls,
	MediaPlaceholder,
	MediaReplaceFlow,
	MediaUpload,
} from '@wordpress/block-editor';
import { PanelBody, RadioControl } from '@wordpress/components';
import { useMemo } from '@wordpress/element';
import { _x } from '@wordpress/i18n';

import { ImageEdit, VideoEdit } from '#/components';
import block from './block.json';

// styles
import './styles.css';
import './styles.edit.css';

/**
 * COMPONENT EDITOR
 */
const Edit = (props: WpBlockEditProps<MediaAttributes>) => {
	const { mediaType, image, video /*, isSticky*/ } = props.attributes;

	const getYoutubeVideoIdFromUrl = useCallback((url: string) => {
		const regExp =
			/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
		const match = url.match(regExp);
		if (match && match[2].length == 11) {
			return match[2];
		}
	}, []);

	const getVimeoVideoIdFromUrl = useCallback((url: string) => {
		const regExp =
			/^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
		const match = regExp.exec(url);
		if (match) {
			return match[5];
		}
	}, []);

	const onSelectImage = useCallback(
		(media: MediaUploadType) => {
			props.setAttributes({
				image: {
					id: media.id,
					src: media.url,
					alt: media.alt,
					width: media.width,
					height: media.height,
					caption: media.caption,
				},
			});
		},
		[props]
	);

	const onSelectVideo = useCallback(
		(media: MediaUploadType) => {
			props.setAttributes({
				video: {
					src: media.src,
					id: media.id,
					poster:
						media.image?.src !== media.icon
							? media.image
							: undefined,
					caption: media.caption,
				},
			});
		},
		[props]
	);

	const onSelectVideoUrl = useCallback(
		(url: string) => {
			let videoId;
			let source: 'youtube' | 'vimeo' | undefined;

			if (url.includes('youtu')) {
				source = 'youtube';
				videoId = getYoutubeVideoIdFromUrl(url);
			} else if (url.includes('vimeo')) {
				source = 'vimeo';
				videoId = getVimeoVideoIdFromUrl(url);
			}

			props.setAttributes({
				video: {
					src: url,
					source: source,
					id: videoId || '',
					poster: { src: '', alt: '', width: 0, height: 0 },
					caption: '',
				},
			});
		},
		[props, getYoutubeVideoIdFromUrl, getVimeoVideoIdFromUrl]
	);

	const mediaPlaceholderConfigs = useMemo(() => {
		if (mediaType === 'image') {
			return {
				key: 'image-media-placeholder',
				icon: 'format-image',
				instructions: _x(
					'Upload an image file or pick one from your media library.',
					'Media Block',
					'supt'
				),
				onSelect: onSelectImage,
				onSelectURL: undefined,
				value: {
					...image,
					id: image?.id || 0,
					url: (image?.src || '') as string,
				},
				accept: 'image/*',
				allowedTypes: ['image'],
				disableMediaButtons: !!image?.src,
			};
		} else if (mediaType === 'video') {
			return {
				key: 'video-media-placeholder',
				icon: 'media-video',
				instructions: _x(
					'Upload a video file, pick one from your media library, or add one with a URL (only Youtube or Vimeo urls will work).',
					'Media Block',
					'supt'
				),
				onSelect: onSelectVideo,
				onSelectURL: onSelectVideoUrl,
				value: {
					...video,
					id: Number.parseInt(video?.id || '0', 10),
					url: video?.src ?? '',
				},
				accept: 'video/*',
				allowedTypes: ['video'],
				disableMediaButtons: !!video?.id,
			};
		}
	}, [
		mediaType,
		image,
		video,
		onSelectImage,
		onSelectVideo,
		onSelectVideoUrl,
	]);

	return (
		<>
			{/* Settings Sidebar */}
			<InspectorControls>
				{/* Controls */}
				<PanelBody
					opened={true}
					title={_x('Media settings', 'Panel title', 'supt')}
				>
					<RadioControl
						label={_x('Media type', 'Panel title', 'supt')}
						selected={mediaType}
						options={[
							{
								label: _x('Image', 'Media block', 'supt'),
								value: 'image',
							},
							{
								label: _x('Video', 'Media block', 'supt'),
								value: 'video',
							},
						]}
						onChange={(mediaType: MediaUploadType) => {
							props.setAttributes({
								mediaType,
							});
						}}
					/>
					{/* <ToggleControl
						label={_x(
							'Media sticks with content',
							'Media block',
							'supt'
						)}
						help={
							isSticky
								? _x('Media is sticky', 'Media block', 'supt')
								: _x(
										'Media is not sticky',
										'Media block',
										'supt'
									)
						}
						checked={isSticky}
						onChange={() =>
							props.setAttributes({ isSticky: !isSticky })
						}
					/> */}
				</PanelBody>
			</InspectorControls>

			{/* Settings toolbar */}
			{video?.id ? (
				<BlockControls>
					<MediaReplaceFlow
						mediaId={Number.parseInt(video.id, 10)}
						mediaURL={video.src}
						allowedTypes={['video']}
						accept="video/*"
						onSelect={onSelectVideo}
						onSelectURL={onSelectVideoUrl}
					/>
				</BlockControls>
			) : null}

			{/* Block Editor */}
			<div
				className={cx('supt-media', {
					// '-is-sticky': isSticky,
				})}
			>
				{!image?.src && !video?.id && mediaPlaceholderConfigs ? (
					<MediaPlaceholder
						key={mediaPlaceholderConfigs.key}
						icon={mediaPlaceholderConfigs.icon}
						labels={{
							instructions: mediaPlaceholderConfigs.instructions,
						}}
						onSelect={mediaPlaceholderConfigs.onSelect}
						onSelectURL={mediaPlaceholderConfigs.onSelectURL}
						value={mediaPlaceholderConfigs?.value}
						accept={mediaPlaceholderConfigs.accept}
						allowedTypes={mediaPlaceholderConfigs.allowedTypes}
						disableMediaButtons={
							mediaPlaceholderConfigs.disableMediaButtons
						}
						isSelected={props.isSelected}
					/>
				) : image?.src ? (
					<ImageEdit
						attributes={{ ...image, id: image.id || 0 }}
						hasCaption={true}
						isCover={false}
						isSelected={props.isSelected}
						onChange={(attrs: object) =>
							props.setAttributes({
								image: { ...image, ...attrs },
							})
						}
					/>
				) : (
					video && (
						<VideoEdit
							attributes={video}
							onChange={(attrs: object) =>
								props.setAttributes({
									video: { ...video, ...attrs },
								})
							}
							posterOnly
						/>
					)
				)}
			</div>
		</>
	);
};

/**
 * WORDPRESS BLOCK
 */
export const MediaBlock: WpBlockType<MediaAttributes> = {
	slug: block.slug,
	settings: {
		title: block.title,
		description: _x('', 'Block Media', 'supt'),
		category: 'media',
		icon: 'admin-media',
		postTypes: ['page'],
		attributes: {
			image: {
				type: 'object',
				default: {
					id: '',
					src: '',
					alt: '',
				},
			},
			// isSticky: {
			// 	type: 'boolean',
			// 	default: false,
			// },
			mediaType: {
				type: 'string',
				default: 'image',
			},
			video: {
				type: 'object',
				default: {
					id: '',
					source: '',
					poster: '',
					caption: '',
				},
			},
		},
		edit: Edit,
		save: () => null,
	},
};
