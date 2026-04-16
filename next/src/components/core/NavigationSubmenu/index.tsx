import NavigationLink from '../NavigationLink';
import './styles.css';

export default function NavigationSubmenu(props: NavigationSubmenuProps) {
  return (
    <div className="wp-block-navigation-submenu">
      <NavigationLink
        className="wp-block-navigation-submenu__label"
        label={props.label}
        url={props.url}
      />
      <ul className="wp-block-navigation-submenu__items">{props.children}</ul>
    </div>
  );
}
