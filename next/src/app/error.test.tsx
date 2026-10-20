// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LocaleProvider } from '@/contexts/locale-context';
import en from '@/i18n/dictionaries/en.json';
import fr from '@/i18n/dictionaries/fr.json';
import { setUpRoot } from '@/test-utils/render-pages';

import ErrorBoundary from './error';

const configs = vi.hoisted(() => ({ isMultilang: false }));

vi.mock('@/configs.json', () => ({ default: configs }));

const failure = (digest?: string) =>
	Object.assign(new Error('WordPress read failed'), { digest });

describe('error', () => {
	const test = setUpRoot();

	const render = (
		locale: string,
		dictionary: Dictionary,
		{ error = failure(), retry = () => {} } = {}
	) => {
		act(() =>
			test.root.render(
				<LocaleProvider
					locale={locale as Locale}
					dictionary={dictionary}
				>
					<ErrorBoundary error={error} unstable_retry={retry} />
				</LocaleProvider>
			)
		);

		return test.container;
	};

	const homeLink = () =>
		Array.from(test.container.querySelectorAll('a')).find(
			(el) => el.textContent === en.error.home
		);

	beforeEach(() => {
		configs.isMultilang = false;
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it.each([
		['en', en],
		['fr', fr],
	])('shows the error page in the page language (%s)', (locale, dict) => {
		const { textContent } = render(locale, dict);

		expect(textContent).toContain(dict.error.title);
		expect(textContent).toContain(dict.error.message);
		expect(textContent).toContain(dict.error.retry);
		expect(textContent).toContain(dict.error.home);
	});

	it('links to the home page', () => {
		render('en', en);

		expect(homeLink()?.getAttribute('href')).toBe('/');
	});

	it('links to the home page of the page language on a multilingual site', () => {
		configs.isMultilang = true;
		// As set by `trailingSlash: true` in next.config.ts
		vi.stubEnv('__NEXT_TRAILING_SLASH', 'true');

		render('en', en);

		expect(homeLink()?.getAttribute('href')).toBe('/en/');
	});

	it('shows the error digest for support', () => {
		const { textContent } = render('en', en, {
			error: failure('1234567890'),
		});

		expect(textContent).toContain(`${en.error.reference} 1234567890`);
	});

	it('shows no error reference without a digest', () => {
		const { textContent } = render('en', en);

		expect(textContent).not.toContain(en.error.reference);
	});

	it('retries the render on "Try again"', () => {
		const retry = vi.fn();
		render('en', en, { retry });

		const button = Array.from(
			test.container.querySelectorAll('button')
		).find((el) => el.textContent === en.error.retry)!;
		act(() => button.click());

		expect(retry).toHaveBeenCalledOnce();
	});
});
