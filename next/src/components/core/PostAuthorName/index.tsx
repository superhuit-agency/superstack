import cx from 'classnames';
import './styles.css';

export default function PostAuthorName({
  name,
  uri,
  isLink,
  linkTarget,
  className,
}: PostAuthorNameProps) {
  const Tag = isLink ? 'a' : 'p';

  return (
    <Tag
      className={cx('wp-block-post-author__name', className)}
      {...(isLink ? { href: uri, target: linkTarget } : {})}
    >
      {name}
    </Tag>
  );
}
