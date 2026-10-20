// @vitest-environment happy-dom
import Cookies from 'js-cookie';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LocaleProvider } from '@/contexts/locale-context';
import en from '@/i18n/dictionaries/en.json';
import { setUpRoot } from '@/test-utils/render-pages';

import Gdpr from '.';

const DENIED = {
	ad_storage: 'denied',
	analytics_storage: 'denied',
	ad_user_data: 'denied',
	ad_personalization: 'denied',
};

function consentUpdates() {
	return (window.dataLayer ?? [])
		.map((entry) => Array.from(entry as ArrayLike<unknown>))
		.filter(
			([command, action]) => command === 'consent' && action === 'update'
		)
		.map(([, , params]) => params);
}

describe('Gdpr', () => {
	const test = setUpRoot();

	const render = () =>
		act(() =>
			test.root.render(
				<LocaleProvider locale={'en' as Locale} dictionary={en}>
					<Gdpr />
				</LocaleProvider>
			)
		);

	const banner = () =>
		test.container.querySelector<HTMLElement>('.supt-gdpr-banner')!;
	const modal = () =>
		test.container.querySelector<HTMLElement>('.supt-gdpr-modal')!;
	const button = (text: string) =>
		Array.from(test.container.querySelectorAll('button')).find(
			(el) => el.textContent === text
		)!;
	const clickAndWait = (text: string) => {
		act(() => button(text).click());
		act(() => vi.advanceTimersByTime(300));
	};

	beforeEach(() => {
		vi.useFakeTimers();
		window.dataLayer = [];
	});

	afterEach(() => {
		vi.useRealTimers();
		Object.keys(Cookies.get()).forEach((name) => Cookies.remove(name));
		delete window.dataLayer;
	});

	it('shows the banner on the first visit, without granting anything', () => {
		render();

		expect(banner().getAttribute('aria-hidden')).toBe('false');
		expect(banner().getAttribute('aria-labelledby')).toBe(
			'cookie-law-banner:title'
		);
		expect(modal().getAttribute('aria-hidden')).toBe('true');
		expect(consentUpdates()).toEqual([]);
	});

	it('grants analytics and remembers it when all is accepted', () => {
		render();
		clickAndWait(en.gdpr.banner.acceptAll);

		expect(banner().getAttribute('aria-hidden')).toBe('true');
		expect(Cookies.get('supt-cookie-law-consent_analytics_accepted')).toBe(
			'yes'
		);
		expect(Cookies.get('supt-cookie-law-consent_banner')).toBe('dismiss');
		expect(consentUpdates()).toEqual([
			{ ...DENIED, analytics_storage: 'granted' },
		]);
	});

	it('pushes the consent again from the cookies after a reload, with the banner hidden', () => {
		Cookies.set('supt-cookie-law-consent_banner', 'dismiss');
		Cookies.set('supt-cookie-law-consent_analytics_accepted', 'yes');

		render();

		expect(banner().getAttribute('aria-hidden')).toBe('true');
		expect(consentUpdates()).toEqual([
			{ ...DENIED, analytics_storage: 'granted' },
		]);
	});

	it('keeps everything denied when all is refused', () => {
		render();
		clickAndWait(en.gdpr.banner.rejectAll);

		expect(banner().getAttribute('aria-hidden')).toBe('true');
		expect(Cookies.get('supt-cookie-law-consent_analytics_accepted')).toBe(
			'no'
		);
		expect(consentUpdates()).toEqual([]);
	});

	it('opens the modal on the `#manage-cookies` hash', () => {
		Cookies.set('supt-cookie-law-consent_banner', 'dismiss');
		render();

		act(() => {
			window.dispatchEvent(
				new HashChangeEvent('hashchange', {
					newURL: `${window.location.origin}/#manage-cookies`,
				})
			);
		});

		expect(modal().getAttribute('aria-hidden')).toBe('false');
	});

	it('saves the categories chosen in the modal', () => {
		render();
		act(() => button(en.gdpr.banner.personalize).click());
		expect(modal().getAttribute('aria-hidden')).toBe('false');

		act(() =>
			test.container
				.querySelector<HTMLInputElement>(
					'#cookie-law-category-checkbox-analytics'
				)!
				.click()
		);
		act(() => button(en.gdpr.modal.save).click());

		expect(modal().getAttribute('aria-hidden')).toBe('true');
		expect(banner().getAttribute('aria-hidden')).toBe('true');
		expect(Cookies.get('supt-cookie-law-consent_analytics_accepted')).toBe(
			'yes'
		);
		expect(consentUpdates()).toEqual([
			{ ...DENIED, analytics_storage: 'granted' },
		]);
	});
});
