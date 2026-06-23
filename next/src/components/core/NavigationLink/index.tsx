import { Link } from '@/components/custom/atoms/Link';
import cx from 'classnames';

export default function NavigationLink(props: NavigationLinkProps) {
	return (
		<li
			className={cx('wp-block-navigation-link', props.className)}
			role="menuitem"
		>
			<Link
				href={props.url}
				className="wp-block-navigation-link"
				{...props}
			>
				{props.label}
			</Link>
		</li>
	);
}
