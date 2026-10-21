// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import NavigationLanguageSwitcher from '@/components/atoms/NavigationLanguageSwitcher';
import { setUpRoot } from '@/test-utils/render-pages';

import NavigationLink from '../NavigationLink';
import NavigationSubmenu from '../NavigationSubmenu';
import Navigation from '.';

vi.mock('next/navigation', () => ({
	usePathname: () => '/en/about',
}));

function addAlternate(hreflang: string, href: string) {
	const link = document.createElement('link');
	link.rel = 'alternate';
	link.hreflang = hreflang;
	link.href = href;
	document.head.appendChild(link);
}

describe('Navigation', () => {
	const test = setUpRoot();

	afterEach(() => {
		document.head
			.querySelectorAll('link[rel="alternate"]')
			.forEach((link) => link.remove());
	});

	function renderHeader() {
		addAlternate('en-US', 'https://example.com/en/about');
		addAlternate('fr-FR', 'https://example.com/fr/a-propos');

		act(() =>
			test.root.render(
				<Navigation>
					<NavigationLink label="Home" url="#home" />
					<NavigationSubmenu label="Product" url="#product">
						<NavigationLink label="Planning" url="#planning" />
						<NavigationLink label="Payroll" url="#payroll" />
					</NavigationSubmenu>
					<NavigationLanguageSwitcher />
				</Navigation>
			)
		);
	}

	it('renders the language switcher it is given', () => {
		renderHeader();

		expect(
			test.container.querySelectorAll('.lang-switcher a')
		).toHaveLength(2);
	});

	it('has only <li> as direct children of its lists', () => {
		renderHeader();

		const lists = test.container.querySelectorAll('ul');
		expect(lists.length).toBeGreaterThanOrEqual(3);

		lists.forEach((list) => {
			Array.from(list.children).forEach((child) => {
				expect(child.tagName).toBe('LI');
			});
		});
	});

	it('does not use the ARIA menu pattern', () => {
		renderHeader();

		expect(
			test.container.querySelectorAll(
				'[role="menu"], [role="menubar"], [role="menuitem"], [role="none"]'
			)
		).toHaveLength(0);
	});
});
