// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { setUpRoot } from '@/test-utils/render-pages';

import { GoogleTagManagerPageview } from '.';

const navigation = vi.hoisted(() => ({ pathname: '/' }));

vi.mock('next/navigation', () => ({
	usePathname: () => navigation.pathname,
}));

describe('GoogleTagManagerPageview', () => {
	const test = setUpRoot();

	afterEach(() => {
		delete window.dataLayer;
	});

	it('pushes a pageview with the path on each navigation', () => {
		navigation.pathname = '/';
		act(() => test.root.render(<GoogleTagManagerPageview />));

		navigation.pathname = '/about/';
		act(() => test.root.render(<GoogleTagManagerPageview />));

		expect(window.dataLayer).toEqual([
			{ event: 'pageview', page_path: '/' },
			{ event: 'pageview', page_path: '/about/' },
		]);
	});
});
