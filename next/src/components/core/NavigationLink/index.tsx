import Link from 'next/link';
import cx from 'classnames';

export default function NavigationLink(props: NavigationLinkProps) {
  return (
    <li className={cx('wp-block-navigation-link', props.className)}>
      <Link href={props.url} className="wp-block-navigation-link">
        {props.label}
      </Link>
    </li>
  );
}
