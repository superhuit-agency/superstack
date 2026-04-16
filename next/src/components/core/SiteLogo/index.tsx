import Image from 'next/image';
import Link from 'next/link';

export default function SiteLogo(props: SiteLogoProps) {
  if (!props.url) return null;

  return (
    <Link href="/" className="wp-block-site-logo">
      <Image
        src={props.url}
        alt="Site Logo"
        width={props.width}
        height={props.height}
        className="custom-logo"
      />
    </Link>
  );
}
