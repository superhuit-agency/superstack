import { Link } from '@/components/custom/atoms/Link';
import cx from 'classnames';

export default function NavigationLink({
	as: Tag = 'li',
	...props
}: NavigationLinkProps) {
	return (
		<Tag className={cx('wp-block-navigation-link', props.className)}>
			<Link
				href={props.url}
				className="wp-block-navigation-link"
				{...props}
			>
				{props.label}
			</Link>
		</Tag>
	);
}
