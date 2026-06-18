'use client';
import { useState } from 'react';

import NavigationLink from '../NavigationLink';
import './styles.css';

export default function NavigationSubmenu(props: NavigationSubmenuProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div className="wp-block-navigation-submenu">
			<NavigationLink
				className="wp-block-navigation-submenu__label"
				label={props.label}
				url={props.url}
				aria-haspopup="true"
				aria-expanded={isExpanded ? 'true' : 'false'}
				aria-controls={`navigation-submenu-${props.label}`}
				id={`navigation-button-${props.label}`}
				onMouseEnter={() => setIsExpanded(true)}
				onMouseLeave={() => setIsExpanded(false)}
			/>
			<ul
				className="wp-block-navigation-submenu__items"
				id={`navigation-submenu-${props.label}`}
				role="menu"
				aria-labelledby={`navigation-button-${props.label}`}
			>
				{props.children}
			</ul>
		</div>
	);
}
