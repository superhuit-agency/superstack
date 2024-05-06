import cx from 'classnames';
import Img from 'next/image';
import { FC, forwardRef } from 'react';

import { BlockConfigs, ImageProps } from '@/typings';

import block from './block.json';

// styles
import './styles.css';

/**
 * COMPONENT
 */
export const Image: FC<ImageProps> & BlockConfigs = forwardRef<
	HTMLElement,
	ImageProps
>(
	(
		{
			alt,
			src,
			width,
			height,
			caption,
			className = '',
			priority = false,
			quality = 95,
			fill = false,
			style,
			children,
			id,
			...props // rest of the props that get passed to the netxjs image
		},
		ref
	) => {
		if (!src) return null;

		return (
			<figure
				ref={ref}
				className={cx('supt-figure', className)}
				style={style}
			>
				{/* {!width && !height && !fill ? (
					// no need to optimise (we are either rendering an svg or outside of Next.js context)
					<img
						src={src as string}
						alt={alt ?? ''}
						className="supt-figure__image"
					/>
				) : ( */}
				<Img
					src={src as string}
					alt={alt ?? ''}
					className="supt-figure__image"
					width={fill ? undefined : width}
					height={fill ? undefined : height}
					priority={priority}
					quality={quality}
					fill={fill}
					unoptimized={
						(src as string)?.endsWith?.('.svg') ||
						process.env.NEXT_PUBLIC_IS_THIS_NEXT !== 'true' // Only optimise image if in Nextjs (we don't want to optimize images on WP side as there isn't Next server running)
					}
					id={id?.toString()}
					{...props}
				/>
				{/* )} */}
				{caption && (
					<figcaption className="supt-figure__figcaption">
						{caption}
					</figcaption>
				)}
			</figure>
		);
	}
);

Image.displayName = 'Image';

Image.slug = block.slug;
Image.title = block.title;
