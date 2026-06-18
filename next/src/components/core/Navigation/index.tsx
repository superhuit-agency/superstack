import './styles.css';

export default function Navigation(props: NavigationProps) {
	return (
		<nav className="wp-block-navigation">
			<ul className="wp-block-navigation__items" role="menubar">
				{props.children}
			</ul>
		</nav>
	);
}
