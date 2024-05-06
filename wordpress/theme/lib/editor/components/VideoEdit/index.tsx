import React from 'react';
import cx from 'classnames';
import { _x } from '@wordpress/i18n';
import {
	PanelBody,
	RadioControl,
	TextControl,
	BaseControl,
	Button,
} from '@wordpress/components';
import {
	InspectorControls,
	RichText,
	MediaUploadCheck,
	MediaUpload,
} from '@wordpress/block-editor';

import { Image } from '@/components/molecules/Image';
import { VideoProps } from '@/typings';

// styles
import '@/components/molecules/Video/styles.css';
import './styles.css';

/**
 * TYPINGS
 */
type VideoEditProps = {
	attributes: VideoProps;
	onChange: Function;
	posterOnly?: boolean;
};

/**
 * COMPONENT
 */
const VideoEdit = ({ attributes, onChange, posterOnly }: VideoEditProps) => {
	const { id, source, poster, caption } = attributes;

	return (
		<>
			<InspectorControls>
				<PanelBody
					opened={true}
					title={_x('Video settings', 'Video', 'supt')}
				>
					{!posterOnly ? (
						<>
							<RadioControl
								label={_x('Video type', 'Video', 'supt')}
								selected={source}
								options={[
									{ label: 'Youtube', value: 'youtube' },
									{ label: 'Vimeo', value: 'vimeo' },
								]}
								onChange={(source: string) => {
									onChange({ source });
								}}
							/>
							<TextControl
								label={_x('Video ID', 'Video', 'supt')}
								value={id}
								onChange={(id: string) => onChange({ id })}
								help={
									<span>
										{_x(
											'Where to find the video ID:',
											'Video',
											'supt'
										)}
										https://vimeo.com/
										<strong>123456789</strong>{' '}
										{_x('or', 'Video', 'supt')}
										https://www.youtube.com/watch?v=
										<strong>AbCdEfgHIj3</strong>
									</span>
								}
							/>
						</>
					) : null}

					<MediaUploadCheck>
						<BaseControl
							className="editor-video-poster-control"
							id=""
						>
							<BaseControl.VisualLabel>
								{_x('Poster image', 'Video', 'supt')}
							</BaseControl.VisualLabel>
							<p>
								{_x(
									'(Image ratio: same as the video ratio)',
									'Video',
									'supt'
								)}
							</p>
							<MediaUpload
								title={_x(
									'Select poster image',
									'Video',
									'supt'
								)}
								onSelect={(media: any) =>
									onChange({
										poster: {
											src: media.url,
											width: media.width,
											height: media.height,
										},
									})
								}
								allowedTypes={['image']}
								render={
									(({ open }: { open: boolean }) => (
										<Button
											variant="primary"
											onClick={open as any}
										>
											{!poster
												? _x('Select', 'Video', 'supt')
												: _x(
														'Replace',
														'Video',
														'supt'
													)}
										</Button>
									)) as any
								}
							/>
						</BaseControl>
					</MediaUploadCheck>
				</PanelBody>
			</InspectorControls>

			<div
				className={cx('supt-video', {
					'-has-poster': poster,
				})}
			>
				<div className="supt-video__wrapper">
					<div className="supt-video__inner">
						<div className="supt-video__play-btn">
							<svg
								className="supt-video__play-icon"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 48 48"
							>
								<g fill="none" fillRule="evenodd">
									<circle
										fill="#0271D2"
										cx="24"
										cy="24"
										r="24"
									/>
									<path fill="#FFF" d="M17 14v20l19-9.913z" />
								</g>
							</svg>

							{/* @ts-ignore (don't know why it's unhappy....) */}
							<Image
								{...poster}
								className="supt-video__poster"
								alt=""
							/>
						</div>
					</div>
				</div>
				<RichText
					className="supt-video__caption"
					tagName="figcaption"
					placeholder={_x(
						'Add a caption',
						'Caption Placeholder',
						'supt'
					)}
					value={caption}
					onChange={(caption: string) => onChange({ caption })}
					allowedFormats={[]}
				/>
			</div>
		</>
	);
};

export default VideoEdit;
