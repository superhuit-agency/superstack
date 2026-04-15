import cx from 'classnames';

import './styles.css';

export default function SocialLinks(props: SocialLinksProps) {
  return (
    <ul
      className={cx(
        'supt-social-links',
        'wp-block-social-links',
        props.className,
        {
          '-is-aligned-left': props.align === 'left',
          '-is-aligned-center': props.align === 'center',
          '-is-aligned-right': props.align === 'right',
        },
      )}
    >
      {props.children}
    </ul>
  );
}
