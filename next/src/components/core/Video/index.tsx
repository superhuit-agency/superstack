import cx from 'classnames';

import block from './block.json';

import './styles.css';

// TODO :: Find out why GraphQL doesn't return the autoplay, playsInline, loop and muted attributes 🤷🏽‍♀️
export default function Video({
	src,
	controls = true,
	caption,
	poster,
	autoplay,
	loop,
	muted,
	playsInline,
	preload,
	className,
	tracks,
}: VideoProps) {
	return (
		<figure className={cx('wp-block-video', className)}>
			<video
				src={src}
				controls={controls}
				preload={preload}
				autoPlay={autoplay}
				loop={loop}
				muted={muted}
				playsInline={playsInline}
				poster={poster ? poster : undefined}
			>
				{tracks?.map((track) => (
					<track
						key={track.src}
						src={track.src}
						kind={track.kind}
						label={track.label}
						srcLang={track.srclang}
					/>
				))}
			</video>
			{caption && (
				<figcaption className="wp-element-caption">
					{caption}
				</figcaption>
			)}
		</figure>
	);
}

Video.slug = block.slug;
Video.title = block.title;
