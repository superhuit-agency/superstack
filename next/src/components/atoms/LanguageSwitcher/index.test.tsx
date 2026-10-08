// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { setUpRoot } from '@/test-utils/render-pages';

import LanguageSwitcher from '.';

vi.mock('next/navigation', () => ({
	usePathname: () => '/fr/a-propos',
}));

function addAlternate(hreflang: string, href: string) {
	const link = document.createElement('link');
	link.rel = 'alternate';
	link.hreflang = hreflang;
	link.href = href;
	document.head.appendChild(link);
}

describe('LanguageSwitcher', () => {
	const test = setUpRoot();

	afterEach(() => {
		document.head
			.querySelectorAll('link[rel="alternate"]')
			.forEach((link) => link.remove());
	});

	it('links to each language but not to x-default', () => {
		addAlternate('en-US', 'https://example.com/en/about');
		addAlternate('fr-FR', 'https://example.com/fr/a-propos');
		addAlternate('x-default', 'https://example.com/en/about');

		act(() => test.root.render(<LanguageSwitcher />));

		const links = Array.from(test.container.querySelectorAll('a'));
		expect(
			links.map((link) => [
				link.textContent,
				link.getAttribute('hreflang'),
				link.getAttribute('href'),
			])
		).toEqual([
			['EN', 'en-US', '/en/about'],
			['FR', 'fr-FR', '/fr/a-propos'],
		]);
		expect(links[1].getAttribute('aria-current')).toBe('true');
	});
});
