'use client';

import cx from 'classnames';
import { FC, forwardRef } from 'react';
// import NextImage from 'next/image';
import dynamic from 'next/dynamic';

import { useIsEditor } from '@/hooks/use-is-editor';

import block from './block.json';

const NextImage = dynamic(() => import('next/image'), {
	loading: () => <div>Loading...</div>,
});

// styles
import './styles.css';

/**
 * COMPONENT
 */
export const Image: FC<ImageProps> & BlockConfigs = forwardRef<
	HTMLImageElement,
	ImageProps
>(
	(
		{
			alt = '',
			caption,
			children,
			className = '',
			fill = false,
			height,
			id,
			priority = false,
			quality = 95,
			src,
			style,
			width,
			...props // rest of the props that get passed to the netxjs image
		},
		ref
	) => {
		const isEditor = useIsEditor();

		if (!src) return null;

		// WP Editor doesn't support next/image, so we need to return a regular anchor tag
		if (isEditor) {
			return (
				<figure
					ref={ref}
					className={cx('supt-figure', className)}
					style={style}
				>
					<img
						src={src}
						alt={alt}
						className="supt-figure__image"
						{...props}
					/>
				</figure>
			);
		}

		return (
			<figure
				ref={ref}
				className={cx('supt-figure', className)}
				style={style}
			>
				<NextImage
					src={src}
					alt={alt}
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
