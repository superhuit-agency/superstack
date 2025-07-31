import cx from 'classnames';
import { forwardRef } from 'react';

// WP Editor doesn't support next/image, so we need to return a regular img tag
const MockedImage = forwardRef(
	({ className, style, src, alt, caption, ...props }: any, ref: any) => {
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
				{caption && (
					<figcaption className="supt-figure__figcaption">
						{caption}
					</figcaption>
				)}
			</figure>
		);
	}
);

export default MockedImage;
