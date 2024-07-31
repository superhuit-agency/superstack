import { FC } from 'react';
import cx from 'classnames';

// internal imports
import { Image } from '../Image';
import { Video } from '../Video';
import block from './block.json';

// styles
import './styles.css';

export const Media: FC<MediaProps> & BlockConfigs = ({
	image,
	// isSticky,
	mediaType = 'image',
	video,
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
