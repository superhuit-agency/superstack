// @vitest-environment happy-dom
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';

import fr from '@/i18n/dictionaries/fr.json';
import Custom500 from '@/pages/500';
import { setUpRoot } from '@/test-utils/render-pages';

vi.mock('@/configs.json', () => ({ default: { isMultilang: false } }));

// Kept out of `src/pages`, where every file is a route
describe('pages/500', () => {
	const test = setUpRoot();

	it('shows the error page in the default locale, without an error reference', () => {
		act(() => test.root.render(<Custom500 />));

		const { textContent } = test.container;

		expect(textContent).toContain(fr.error.title);
		expect(textContent).toContain(fr.error.retry);
		expect(textContent).not.toContain(fr.error.reference);
	});
});
