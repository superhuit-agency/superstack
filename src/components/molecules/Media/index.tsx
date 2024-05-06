import { FC } from 'react';
import cx from 'classnames';

// internal imports
import { BlockConfigs, ImageProps, VideoProps } from '@/typings';
import { Image } from '../Image';
import { Video } from '../Video';
import block from './block.json';

// styles
import './styles.css';

/**
 * TYPINGS
 */
export type MediaProps = {
	mediaType?: 'image' | 'video';
	image?: ImageProps;
	video?: VideoProps;
	// isSticky?: boolean;
};

/**
 * COMPONENT
 */
export const Media: FC<MediaProps> & BlockConfigs = ({
	mediaType = 'image',
	image,
	video,
	// isSticky,
}) => {
	return (
		<div
			className={cx('supt-media', {
				// '-is-sticky': isSticky,
			})}
		>
			{mediaType === 'image' ? (
				<Image
					{...(image as ImageProps)}
					alt={image?.alt || ''}
					className="supt-media__image"
				/>
			) : (
				<Video {...(video as VideoProps)} />
			)}
		</div>
	);
};

Media.slug = block.slug;
Media.title = block.title;
