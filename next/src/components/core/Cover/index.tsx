import cx from 'classnames';
import NextImage from 'next/image';

import block from './block.json';

import './styles.css';

export default function Cover({
	overlayColor,
	url,
	dimRatio,
	minHeight,
	focalPoint,
	children,
}: CoverProps) {
	return (
		<div className="wp-block-cover" style={{ minHeight }}>
			{url ? (
				<NextImage
					src={url}
					fill
					alt=""
					className="wp-block-cover__image-background"
					style={{
						objectPosition: focalPoint
							? `${focalPoint.x}% ${focalPoint.y}%`
							: undefined,
					}}
				/>
			) : null}
			<span
				aria-hidden="true"
				className={cx(
					'wp-block-cover__background',
					`has-background-dim-${dimRatio}`
				)}
				style={{
					backgroundColor: `var(--wp--preset--color--${overlayColor})`,
				}}
			/>
			<div className="wp-block-cover__inner-container">{children}</div>
		</div>
	);
}

Cover.slug = block.slug;
Cover.title = block.title;
