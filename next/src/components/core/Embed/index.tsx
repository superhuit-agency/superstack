import cx from 'classnames';

import block from './block.json';

import './styles.css';

// TODO :: See if needed to handle other providers like SoundCloud, etc.
function getEmbedUrl(
	rawUrl?: string,
	providerNameSlug?: string,
	type?: string
): string | null {
	if (!rawUrl) return null;

	if (providerNameSlug === 'youtube') {
		const videoId = rawUrl.match(/[?&]v=([^&]+)/)?.[1];
		if (!videoId) return null;
		const finalUrl = `https://www.youtube.com/embed/${videoId}?feature=oembed`;

		return finalUrl;
	} else if (providerNameSlug === 'vimeo') {
		const videoId = rawUrl.match(/vimeo\.com\/([^?]+)/)?.[1];
		if (!videoId) return null;
		const finalUrl = ` https://player.vimeo.com/video/${videoId}`;

		return finalUrl;
	}
	return null;
}

export default function Embed({
	providerNameSlug,
	url,
	caption,
	type,
}: EmbedProps) {
	const embedUrl = getEmbedUrl(url, providerNameSlug, type);

	return (
		<figure
			className={cx('wp-block-embed', {
				[`is-type-${type}`]: type,
				[`is-provider-${providerNameSlug}`]: providerNameSlug,
				[`wp-block-embed-${providerNameSlug}`]: providerNameSlug,
			})}
		>
			<div className="wp-block-embed__wrapper">
				{embedUrl ? (
					<iframe
						src={embedUrl}
						loading="lazy"
						allowFullScreen
						referrerPolicy="strict-origin-when-cross-origin"
						title={type}
					/>
				) : (
					<a href={url} target="_blank" rel="noreferrer">
						{url}
					</a>
				)}
			</div>
			{caption && (
				<figcaption className="wp-element-caption">
					{caption}
				</figcaption>
			)}
		</figure>
	);
}

Embed.slug = block.slug;
Embed.title = block.title;
