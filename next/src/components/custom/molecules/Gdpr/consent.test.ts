// @vitest-environment happy-dom
import Cookies from 'js-cookie';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	consentDefaultsScript,
	createConsentUpdater,
	getCategoryCookieName,
} from './consent';

const DENIED = {
	ad_storage: 'denied',
	analytics_storage: 'denied',
	ad_user_data: 'denied',
	ad_personalization: 'denied',
};

function dataLayerCommands() {
	return (window.dataLayer ?? []).map((entry) =>
		Array.from(entry as ArrayLike<unknown>)
	);
}

describe('consent', () => {
	beforeEach(() => {
		window.dataLayer = [];
	});

	afterEach(() => {
		Object.keys(Cookies.get()).forEach((name) => Cookies.remove(name));
		delete window.dataLayer;
	});

	describe('consentDefaultsScript', () => {
		it('pushes the Consent Mode default with every type denied', () => {
			delete window.dataLayer;

			new Function(consentDefaultsScript)();

			expect(dataLayerCommands()).toEqual([
				['consent', 'default', { ...DENIED, wait_for_update: 500 }],
			]);
		});

		it('pushes an `arguments` object, the only shape gtag.js reads as a command', () => {
			new Function(consentDefaultsScript)();

			expect(Object.prototype.toString.call(window.dataLayer![0])).toBe(
				'[object Arguments]'
			);
		});
	});

	describe('createConsentUpdater', () => {
		it('pushes nothing while no category is accepted', () => {
			createConsentUpdater()();

			expect(dataLayerCommands()).toEqual([]);
		});

		it('grants the consent types of the categories accepted in the cookies', () => {
			Cookies.set(getCategoryCookieName('analytics'), 'yes');

			createConsentUpdater()();

			expect(dataLayerCommands()).toEqual([
				[
					'consent',
					'update',
					{ ...DENIED, analytics_storage: 'granted' },
				],
			]);
			expect(Object.prototype.toString.call(window.dataLayer![0])).toBe(
				'[object Arguments]'
			);
		});

		it('pushes again only when the consent changes', () => {
			const updateConsent = createConsentUpdater();

			Cookies.set(getCategoryCookieName('analytics'), 'yes');
			updateConsent();
			updateConsent();
			Cookies.set(getCategoryCookieName('analytics'), 'no');
			updateConsent();

			expect(dataLayerCommands()).toEqual([
				[
					'consent',
					'update',
					{ ...DENIED, analytics_storage: 'granted' },
				],
				['consent', 'update', DENIED],
			]);
		});
	});
});
