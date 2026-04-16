import NextImage from 'next/image';
import Link from 'next/link';

export default function Avatar(props: AvatarProps) {
  if (!props.data.url) return null;

  if (props.isLink && props.data.uri) {
    return (
      <Link href={props.data.uri} target={props.linkTarget}>
        <NextImage
          className="wp-block-avatar"
          src={props.data.url}
          alt={props.data.alt ?? 'User Avatar'}
          width={props.size}
          height={props.size}
        />
      </Link>
    );
  }

  return (
    <NextImage
      className="wp-block-avatar"
      src={props.data.url}
      alt={props.data.alt ?? 'User Avatar'}
      width={props.size}
      height={props.size}
    />
  );
}
