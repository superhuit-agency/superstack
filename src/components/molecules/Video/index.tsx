'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import cx from 'classnames';

import { Image } from '../Image';
import block from './block.json';

import './styles.css';

const DEFAULT_THUMBNAIL_ARGS = {
	width: 2560,
	height: 1440,
	unoptimized: true,
	alt: '',
};

export const Video: FC<VideoProps> & BlockConfigs = ({
	caption,
	id,
	poster,
	source,
	src,
}) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [thumbnail, setThumbnail] = useState<ImageProps | undefined>(poster);

	const getVideoUrl = useCallback(() => {
		if (source === 'youtube') {
			return '//www.youtube.com/embed/' + id;
		} else if (source === 'vimeo') {
			return '//player.vimeo.com/video/' + id;
		}
	}, [source, id]);

	/**
	 * Get the thumbnail for the video
	 */
	useEffect(() => {
		if (thumbnail) return;

		if (source === 'youtube') {
			setThumbnail({
				...DEFAULT_THUMBNAIL_ARGS,
				src: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
			});
		} else if (source === 'vimeo') {
			// Vimeo
			fetch(`https://vimeo.com/api/v2/video/${id}.json`, {
				cache: 'force-cache',
			})
				.then((res) => res.json())
				.then(
					([
						{ thumbnail_large, thumbnail_medium, thumbnail_small },
					]) => {
						setThumbnail({
							...DEFAULT_THUMBNAIL_ARGS,
							src:
								thumbnail_large ??
								thumbnail_medium ??
								thumbnail_small,
						});
					}
				)
				.catch((error) => {
					setThumbnail({
						...DEFAULT_THUMBNAIL_ARGS,
						src: `https://via.placeholder.com/900x500/ccc/ccc?text=`,
					});
				});
		}
	}, [source, id, thumbnail]);

	return (
		<div
			className={cx('supt-video', {
				'-is-playing': isPlaying,
			})}
		>
			<div className="supt-video__wrapper">
				<div className="supt-video__inner">
					<button
						onClick={() => setIsPlaying(true)}
						className="supt-video__play-btn"
					>
						<svg
							className="supt-video__play-icon"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 48 48"
						>
							<g fill="none" fillRule="evenodd">
								<circle fill="#0271D2" cx="24" cy="24" r="24" />
								<path fill="#FFF" d="M17 14v20l19-9.913z" />
							</g>
						</svg>

						{thumbnail ? (
							<Image
								{...thumbnail}
								className="supt-video__poster"
								alt=""
							/>
						) : null}
					</button>

					{isPlaying ? (
						src ? (
							<video
								className="supt-video__player"
								src={src}
								autoPlay
								controls
							/>
						) : (
							<iframe
								src={getVideoUrl() + '?autoplay=1'}
								tabIndex={-1}
								allowFullScreen={true}
								className="supt-video__player"
							/>
						)
					) : null}
				</div>
			</div>
			<p className="supt-video__caption">{caption}</p>
		</div>
	);
};

Video.slug = block.slug;
Video.title = block.title;
