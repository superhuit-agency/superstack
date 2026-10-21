'use client';
import { usePathname } from 'next/navigation';
import { useId, useLayoutEffect, useState } from 'react';

import NavigationLink from '../NavigationLink';
import './styles.css';

export default function NavigationSubmenu(props: NavigationSubmenuProps) {
	const id = useId();
	const [isExpanded, setIsExpanded] = useState(false);
	const pathname = usePathname();

	/**
	 * Close the submenu on navigation: with Cache Components, the page left is
	 * hidden in an <Activity>, not unmounted, and keeps its state for when the
	 * user comes back. Layout effects re-run when it is shown again, and run
	 * before paint, so the submenu doesn't flash open.
	 */
	// eslint-disable-next-line react-hooks/set-state-in-effect -- only effects re-run when <Activity> shows the page again
	useLayoutEffect(() => setIsExpanded(false), [pathname]);

	return (
		<li className="wp-block-navigation-submenu">
			<NavigationLink
				as="div"
				className="wp-block-navigation-submenu__label"
				label={props.label}
				url={props.url}
				aria-haspopup="true"
				aria-expanded={isExpanded ? 'true' : 'false'}
				aria-controls={`${id}-items`}
				onMouseEnter={() => setIsExpanded(true)}
				onMouseLeave={() => setIsExpanded(false)}
			/>
			<ul
				className="wp-block-navigation-submenu__items"
				id={`${id}-items`}
			>
				{props.children}
			</ul>
		</li>
	);
}
