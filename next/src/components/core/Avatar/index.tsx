import NextImage from 'next/image';
import Link from 'next/link';
import cx from 'classnames';

export default function Avatar({
	data,
	isLink = false,
	linkTarget = '_self',
	size,
	className,
}: AvatarProps) {
	if (!data.url) return null;

	if (isLink && data.uri) {
		return (
			<Link href={data.uri} target={linkTarget} className={className}>
				<NextImage
					className="wp-block-avatar"
					src={data.url}
					alt={data.alt ?? 'User Avatar'}
					width={size}
					height={size}
				/>
			</Link>
		);
	}

	return (
		<NextImage
			className={cx('wp-block-avatar', className)}
			src={data.url}
			alt={data.alt ?? 'User Avatar'}
			width={size}
			height={size}
		/>
	);
}
