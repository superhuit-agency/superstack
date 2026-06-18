import cx from 'classnames';

import Video from '../Video';
import Image from '../Image';
import block from './block.json';

import './styles.css';

export default function MediaText({
	mediaType,
	mediaUrl,
	mediaAlt,
	mediaPosition,
	mediaWidth,
	imageFill,
	focalPoint,
	children,
}: MediaTextProps) {
	return (
		<div
			className={cx('wp-block-media-text', {
				'has-media-on-the-right': mediaPosition === 'right',
				'is-image-fill-element': imageFill,
			})}
			style={{
				gridTemplateColumns:
					mediaWidth !== 50 ? `${mediaWidth}% auto` : undefined,
			}}
		>
			{mediaType === 'video' ? (
				<Video
					src={mediaUrl}
					controls
					className="wp-block-media-text__media"
				/>
			) : (
				<Image
					url={mediaUrl}
					alt={mediaAlt}
					fill={true}
					focalPoint={focalPoint}
					className="wp-block-media-text__media"
				/>
			)}
			<div className="wp-block-media-text__content">{children}</div>
		</div>
	);
}

MediaText.slug = block.slug;
MediaText.title = block.title;
