// @vitest-environment happy-dom
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import fr from '@/i18n/dictionaries/fr.json';

import GlobalError from './global-error';

const configs = vi.hoisted(() => ({ isMultilang: false }));

vi.mock('@/configs.json', () => ({ default: configs }));

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

	const homeLink = (content: DocumentFragment) =>
		Array.from(content.querySelectorAll('a'))
			.find((el) => el.textContent === fr.error.home)
			?.getAttribute('href');

	beforeEach(() => {
		configs.isMultilang = false;
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('renders its own document in the default language', () => {
		const { html, content } = render();

		expect(html).toMatch(/^<html lang="fr">.*<body>/);
		expect(content.textContent).toContain(fr.error.title);
		expect(content.textContent).toContain(fr.error.retry);
		expect(homeLink(content)).toBe('/');
	});

	it('links to the home page of the default language on a multilingual site', () => {
		configs.isMultilang = true;
		// As set by `trailingSlash: true` in next.config.ts
		vi.stubEnv('__NEXT_TRAILING_SLASH', 'true');

		const { content } = render();

		expect(homeLink(content)).toBe('/fr/');
	});

	it('shows the error digest for support', () => {
		const { content } = render('987654321');

		expect(content.textContent).toContain(
			`${fr.error.reference} 987654321`
		);
	});
});
