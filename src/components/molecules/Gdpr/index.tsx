'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { GoogleTagManager, sendGTMEvent } from '@next/third-parties/google';

import { useLocale } from '@/contexts/locale-context';
import gdprConfigs from '@/gdpr-configs.json';

import { GdprBanner } from './GdprBanner';
import { GdprModal, type GdprModalProps } from './GdprModal';
import { type GdprCategoryType } from './GdprCategory';
import block from './block.json';

/**
 * Constants
 */
const ACCEPTED_VALUE = 'yes';
const REFUSED_VALUE = 'no';
const COOKIES_OPTIONS: Cookies.CookieAttributes = {
	expires: 365,
	sameSite: 'Lax',
};
const COOKIE_NAME = 'supt-cookie-law-consent';

/**
 * Track a cookie banner event via the internal API.
 * Fire-and-forget: failures are silently ignored so analytics never break UX.
 */
const trackCookieEvent = (
	eventType: 'impression' | 'accept' | 'reject' | 'personalize'
) => {
	fetch('/api/cookie-stats', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ event_type: eventType }),
	}).catch(() => {
		// Silent fail
	});
};

/**
 * COMPONENT
 */
export const Gdpr: FC<GdprProps> & BlockConfigs = () => {
	const [categories, setCategories] = useState<GdprCategoryType[]>([]);
	const [bannerDismissed, setBannerDismissed] = useState(true);
	const [gdprServices, setGdprServices] = useState<any>({});
	const { locale } = useLocale();

	const services = useRef({});

	const modalRef = useRef<{
		open: () => {};
		setCategoryEnabled: (
			category: Record<string, any>,
			enabled: boolean
		) => {};
	}>(null);

	const setCategoryCookie = useCallback(
		(category: { id: string; services?: string[] }, accepted = false) => {
			Cookies.set(
				`${COOKIE_NAME}_${category.id}_accepted`,
				accepted ? ACCEPTED_VALUE : REFUSED_VALUE,
				COOKIES_OPTIONS
			);

			if (category.services) {
				category.services.forEach((name: string) => {
					services.current = {
						...services.current,
						[name]: {
							isAccepted: accepted,
						},
					};
				});

				setGdprServices(services.current); // Needs to be set from a ref to avoid overriding state that wasn't updated yet
			}
		},
		[setGdprServices]
	);

	// ##############################
	// #region Event handler
	// ##############################

	const onPersonalizeClick = useCallback(() => {
		trackCookieEvent('personalize');
		modalRef.current?.open();
	}, []);

	const onHashChange = useCallback((event: HashChangeEvent /*url*/) => {
		if (event.newURL.indexOf(`#${gdprConfigs.hash}`) === -1) return;

		modalRef.current?.open();

		window.history.replaceState(
			'',
			'Cookie Manager',
			window.location.pathname + window.location.search
		);
	}, []);

	const onModalClosed = useCallback(() => {
		if (window.location.hash.indexOf(`#${gdprConfigs.hash}`) === -1) return;

		window.history.replaceState(
			'',
			document.title,
			window.location.pathname + window.location.search
		);
	}, []);

	const onModalSaved = useCallback(() => {
		setBannerDismissed(true);
		updateGTMConsent(gdprServices.googletagmanager?.isAccepted ?? false);
	}, []);

	const onCategoryChange: GdprModalProps['onCategoryChange'] = useCallback(
		({ enabled, id }) => {
			const changedCat = gdprConfigs.categories.find(
				(cat) => cat.id === id
			);
			if (changedCat) setCategoryCookie(changedCat, enabled);
		},
		[setCategoryCookie]
	);

	// ##############################
	// #endregion
	// ##############################

	// ##############################
	// #region Google Consent Mode v2
	// ##############################

	const updateGTMConsent = useCallback((enabled: boolean = false) => {
		if (typeof window === 'undefined' || typeof window.gtag !== 'function')
			return;

		sendGTMEvent({
			event: 'consent',
			value: 'update',
			parameters: {
				ad_storage: enabled ? 'granted' : 'denied',
				ad_user_data: enabled ? 'granted' : 'denied',
				ad_personalization: enabled ? 'granted' : 'denied',
				analytics_storage: enabled ? 'granted' : 'denied',
			},
		});
	}, []);

	const acceptAll = () => {
		trackCookieEvent('accept');
		setBannerDismissed(true);
		Cookies.set(`${COOKIE_NAME}_banner`, 'dismiss', COOKIES_OPTIONS);
		gdprConfigs.categories.forEach((cat) => {
			setCategoryCookie(cat, true);
			modalRef.current?.setCategoryEnabled(cat, true);
			updateGTMConsent(true);
		});
	};

	const rejectAll = () => {
		trackCookieEvent('reject');
		setBannerDismissed(true);
		Cookies.set(`${COOKIE_NAME}_banner`, 'dismiss', COOKIES_OPTIONS);
		gdprConfigs.categories.forEach((cat) => {
			setCategoryCookie(cat, false);
			modalRef.current?.setCategoryEnabled(cat, false);
		});
		updateGTMConsent();
	};

	// TODO :: Move to category file ??
	const getCategoriesSettings = useCallback(() => {
		return gdprConfigs.categories.map((cat) => {
			const cookie = Cookies.get(`${COOKIE_NAME}_${cat.id}_accepted`);
			const enabled = cookie === ACCEPTED_VALUE;

			return { ...cat, enabled };
		});
	}, [gdprConfigs.categories]);

	const impressionTracked = useRef(false);

	useEffect(() => {
		const hasCookies = Cookies.get(`${COOKIE_NAME}_banner`) === 'dismiss';
		setBannerDismissed(hasCookies);

		// Track impression when the banner is shown
		if (!hasCookies && !impressionTracked.current) {
			trackCookieEvent('impression');
			impressionTracked.current = true;
		}

		window.addEventListener('hashchange', onHashChange);

		return () => {
			window.removeEventListener('hashchange', onHashChange);
		};
	}, [onHashChange]);

	// Set categories (triggered everytime the locale changes)
	useEffect(() => {
		const cats = getCategoriesSettings();
		setCategories(cats);
	}, [getCategoriesSettings, locale]);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		window.dataLayer = window.dataLayer || [];
		function gtag() {
			window.dataLayer?.push(arguments);
		}

		window.gtag = window.gtag || gtag;

		// Consent Mode v2 default state (before choice)
		sendGTMEvent({
			event: 'consent',
			value: 'default',
			parameters: {
				ad_storage: 'denied',
				ad_user_data: 'denied',
				ad_personalization: 'denied',
				analytics_storage: 'denied',
			},
		});
	}, []);

	const initializeGTMConsent = useRef(false);

	useEffect(() => {
		if (initializeGTMConsent.current) return;

		//  Wait until googletagmanager is loaded
		if (!process.env.NEXT_PUBLIC_GTM_KEY) return;

		// Wait until the services are loaded
		if (Object.keys(gdprServices).length === 0) return;

		initializeGTMConsent.current = true;

		// Return if the user has not dismissed the banner yet
		const hasCookies = Cookies.get(`${COOKIE_NAME}_banner`) === 'dismiss';
		if (!hasCookies) return;

		// Initialize GTM consent with the saved in cookies categories state
		updateGTMConsent(gdprServices.gtm?.isAccepted ?? false);
	}, [gdprServices, process.env.NEXT_PUBLIC_GTM_KEY, updateGTMConsent]);

	// ##############################
	// #endregion
	// ##############################

	return (
		<>
			<div className="supt-gdpr">
				<GdprBanner
					bannerDismissed={bannerDismissed}
					onPersonalizeClick={onPersonalizeClick}
					onAcceptClick={acceptAll}
					onRejectClick={rejectAll}
				/>
				<GdprModal
					ref={modalRef}
					categories={categories}
					onCategoryChange={onCategoryChange}
					onModalSaved={onModalSaved}
					onModalClosed={onModalClosed}
				/>
			</div>
			{gdprServices?.gtm && process.env.NEXT_PUBLIC_GTM_KEY ? (
				<GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_KEY} />
			) : null}
		</>
	);
};

Gdpr.slug = block.slug;
Gdpr.title = block.title;
