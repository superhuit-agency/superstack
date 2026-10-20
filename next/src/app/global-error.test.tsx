// @vitest-environment happy-dom
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import fr from '@/i18n/dictionaries/fr.json';

import GlobalError from './global-error';

describe('global-error', () => {
	const render = (digest?: string) => {
		const html = renderToStaticMarkup(
			<GlobalError
				error={Object.assign(new Error('Root layout failed'), {
					digest,
				})}
				unstable_retry={() => {}}
			/>
		);

		// A <template> parses the markup without loading its stylesheet
		const template = document.createElement('template');
		template.innerHTML = html;

		return { html, content: template.content };
	};

	it('renders its own document in the default language', () => {
		const { html, content } = render();

		expect(html).toMatch(/^<html lang="fr">.*<body>/);
		expect(content.textContent).toContain(fr.error.title);
		expect(content.textContent).toContain(fr.error.retry);
		expect(
			Array.from(content.querySelectorAll('a'))
				.find((el) => el.textContent === fr.error.home)
				?.getAttribute('href')
		).toBe('/');
	});

	it('shows the error digest for support', () => {
		const { content } = render('987654321');

		expect(content.textContent).toContain(
			`${fr.error.reference} 987654321`
		);
	});
});
