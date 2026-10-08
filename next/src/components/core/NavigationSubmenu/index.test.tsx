// @vitest-environment happy-dom
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderPages, setUpRoot } from '@/test-utils/render-pages';

import Navigation from '../Navigation';
import NavigationSubmenu from '.';

const router = vi.hoisted(() => ({ pathname: '/a' }));

vi.mock('next/navigation', () => ({
	usePathname: () => router.pathname,
}));

const header = (label: string) => (
	<Navigation>
		<NavigationSubmenu label={label} url="">
			<li>Planning</li>
		</NavigationSubmenu>
	</Navigation>
);

/**
 * Resolves an ID reference attribute the way assistive technology does: as a
 * space-separated list of IDs, each pointing at the first match in the document.
 */
const referencedElements = (element: Element, attribute: string) =>
	element
		.getAttribute(attribute)!
		.split(/\s+/)
		.map((id) => document.getElementById(id));

describe('NavigationSubmenu', () => {
	const test = setUpRoot();

	/**
	 * Renders the header of page /a, hidden while the user is on another page,
	 * with `pathname` as what usePathname() returns
	 */
	function visit(currentPage: string, pathname = currentPage) {
		router.pathname = pathname;
		renderPages(test.root, ['/a'], currentPage, () => header('Product'));
	}

	const submenuButton = () =>
		test.container.querySelector<HTMLElement>('[aria-haspopup="true"]')!;

	function hoverSubmenu() {
		act(() => {
			submenuButton().dispatchEvent(
				new MouseEvent('mouseover', { bubbles: true })
			);
		});
		expect(submenuButton().getAttribute('aria-expanded')).toBe('true');
	}

	it('is closed when the user comes back to a page they left with it open', () => {
		visit('/a');
		hoverSubmenu();

		// Its label is a link: clicking it navigates while the pointer is still over it
		visit('/b');
		visit('/a');

		expect(submenuButton().getAttribute('aria-expanded')).toBe('false');
	});

	it('is closed when the page left never sees the pathname change', () => {
		visit('/a');
		hoverSubmenu();

		// A hidden page can keep the pathname it was left with: the reset has to
		// come from <Activity> showing the page again, not from a new pathname
		visit('/b', '/a');
		visit('/a');

		expect(submenuButton().getAttribute('aria-expanded')).toBe('false');
	});

	it.each(['Product', 'Human resources'])(
		'references its own list when a hidden page renders the same submenu (%s)',
		(label) => {
			router.pathname = '/b';
			renderPages(test.root, ['/a', '/b'], '/b', () => header(label));

			const submenus = test.container.querySelectorAll(
				'.wp-block-navigation-submenu'
			);
			expect(submenus).toHaveLength(2);

			submenus.forEach((submenu) => {
				const button = submenu.querySelector('[aria-haspopup="true"]')!;
				const list = submenu.querySelector(
					'.wp-block-navigation-submenu__items'
				)!;

				const controlled = referencedElements(button, 'aria-controls');
				expect(controlled).toHaveLength(1);
				expect(controlled[0]).toBe(list);

				const labelledBy = referencedElements(list, 'aria-labelledby');
				expect(labelledBy).toHaveLength(1);
				expect(labelledBy[0]).toBe(button);
			});
		}
	);
});
