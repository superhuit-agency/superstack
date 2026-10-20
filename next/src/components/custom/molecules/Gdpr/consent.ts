import Cookies from 'js-cookie';

import gdprConfigs from '@/gdpr-configs.json';

/**
 * Google Consent Mode v2
 * @see https://developers.google.com/tag-platform/security/guides/consent
 */
export type ConsentType =
	| 'ad_storage'
	| 'analytics_storage'
	| 'ad_user_data'
	| 'ad_personalization';

type ConsentState = Record<ConsentType, 'granted' | 'denied'>;

export type GdprCategoryType = {
	id: string;
	enabled?: boolean;
	mandatory?: boolean;
	services?: string[];
	consentTypes?: string[];
};

const CONSENT_TYPES: ConsentType[] = [
	'ad_storage',
	'analytics_storage',
	'ad_user_data',
	'ad_personalization',
];

const ACCEPTED_VALUE = 'yes';
const REFUSED_VALUE = 'no';
const COOKIES_OPTIONS: Cookies.CookieAttributes = {
	expires: 365,
	sameSite: 'Lax',
};

export const categories: GdprCategoryType[] = gdprConfigs.categories;

const deniedState = () =>
	Object.fromEntries(
		CONSENT_TYPES.map((type) => [type, 'denied'])
	) as ConsentState;

/**
 * Inline script rendered before GTM, so its tags only fire once the
 * visitor has consented (`wait_for_update` gives the banner time to
 * push the persisted choices).
 * gtag.js only reads commands pushed as an `arguments` object.
 */
export const consentDefaultsScript = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',${JSON.stringify(
	{ ...deniedState(), wait_for_update: 500 }
)});`;

function gtag(command: 'consent', action: 'update', params: ConsentState): void;
function gtag() {
	window.dataLayer = window.dataLayer || [];
	// eslint-disable-next-line prefer-rest-params
	window.dataLayer.push(arguments);
}

/**
 * Cookies
 */
export const getCategoryCookieName = (id: string) =>
	`${gdprConfigs.cookieName}_${id}_accepted`;

const BANNER_COOKIE_NAME = `${gdprConfigs.cookieName}_banner`;

export const isBannerDismissed = () =>
	Cookies.get(BANNER_COOKIE_NAME) === 'dismiss';

export const dismissBanner = () =>
	Cookies.set(BANNER_COOKIE_NAME, 'dismiss', COOKIES_OPTIONS);

export const isCategoryAccepted = (id: string) =>
	Cookies.get(getCategoryCookieName(id)) === ACCEPTED_VALUE;

export const setCategoryAccepted = (id: string, accepted = false) =>
	Cookies.set(
		getCategoryCookieName(id),
		accepted ? ACCEPTED_VALUE : REFUSED_VALUE,
		COOKIES_OPTIONS
	);

export const getCategoriesSettings = (): GdprCategoryType[] =>
	categories.map((cat) => ({ ...cat, enabled: isCategoryAccepted(cat.id) }));

/**
 * Returns a function pushing a Consent Mode `update` from the categories
 * accepted in the cookies, only when it differs from the last one pushed
 * (starting from the defaults, all denied).
 */
export function createConsentUpdater() {
	let lastState = JSON.stringify(deniedState());

	return () => {
		const state = deniedState();

		categories
			.filter((cat) => isCategoryAccepted(cat.id))
			.forEach((cat) =>
				cat.consentTypes?.forEach((type) => {
					if (CONSENT_TYPES.includes(type as ConsentType))
						state[type as ConsentType] = 'granted';
				})
			);

		if (JSON.stringify(state) === lastState) return;

		lastState = JSON.stringify(state);
		gtag('consent', 'update', state);
	};
}
