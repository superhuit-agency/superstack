import NextImage from 'next/image';
import Link from 'next/link';

import './styles.css';

export default function SiteLogo(props: SiteLogoProps) {
	if (!props.url) return null;

	return (
		<Link href="/" className="wp-block-site-logo">
			<NextImage
				src={props.url}
				alt="Site Logo"
				width={props.width}
				height={props.height}
				className="custom-logo"
			/>
		</Link>
	);
}
