import './styles.css';

// TODO :: Add Navigation Context to pass submenuVisibility to submenus
export default function Navigation(props: NavigationProps) {
	return (
		<nav className="wp-block-navigation">
			<ul className="wp-block-navigation__items">{props.children}</ul>
		</nav>
	);
}
