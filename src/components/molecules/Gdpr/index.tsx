'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { GoogleTagManager } from '@next/third-parties/google';

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
 * COMPONENT
 */
export const Gdpr: FC<GdprProps> & BlockConfigs = () => {
	const [categories, setCategories] = useState<GdprCategoryType[]>([]);
	const [bannerDismissed, setBannerDismissed] = useState(true);
	const [gdprServices, setGdprServices] = useState<Record<string, boolean>>(
		{}
	);

	const { locale } = useLocale();

	const services = useRef({});
	const didInitServicesFromCookies = useRef(false);
	const pendingCategoryEnabled = useRef<Record<string, boolean>>({});
	const isGranted = useRef<boolean>(false);

	const modalRef = useRef<{
		open: () => {};
		setCategoryEnabled: (
			category: Record<string, any>,
			enabled: boolean
		) => {};
	}>(null);

	// ##############################
	// #region Google Consent Mode v2
	// ##############################

	const initConsentMode = useCallback(() => {
		if (typeof window === 'undefined') return;

		window.dataLayer = window.dataLayer || [];
		const gtag = (...args: any[]) => {
			window.dataLayer!.push(args);
		};
		window.gtag = window.gtag || gtag;

		// Default: denied for all storages/signals until user consents
		window.gtag('consent', 'default', {
			ad_storage: 'denied',
			analytics_storage: 'denied',
			ad_user_data: 'denied',
			ad_personalization: 'denied',
			wait_for_update: 500,
		});
	}, []);

	const updateConsentForEverything = useCallback((granted: boolean) => {
		isGranted.current = granted;
		window?.gtag?.('consent', 'update', {
			ad_user_data: granted ? 'granted' : 'denied',
			ad_personalization: granted ? 'granted' : 'denied',
			ad_storage: granted ? 'granted' : 'denied',
			analytics_storage: granted ? 'granted' : 'denied',
		});
	}, []);
	const updateConsentFromSettings = useCallback(() => {
		if (typeof window === 'undefined' || typeof window.gtag !== 'function')
			return;

		// Grant analytics when the analytics category is enabled. Others remain denied by default
		const cats = gdprConfigs.categories.map((cat) => {
			const cookie = Cookies.get(`${COOKIE_NAME}_${cat.id}_accepted`);
			const enabled = cookie === ACCEPTED_VALUE;
			return { ...cat, enabled } as any;
		});

		// TODO :: Update this if there's multiple/different categories (currently there's only one + the necessary one)
		const analyticsEnabled =
			cats.find((c: any) => c.id === 'analytics' && c.enabled)?.enabled ??
			false;

		if (isGranted.current !== analyticsEnabled) {
			// Only update if the consent has changed
			updateConsentForEverything(analyticsEnabled);
		}
	}, []);

	useEffect(() => {
		initConsentMode();
		isGranted.current = false;

		// Reflect persisted choices on first load
		updateConsentFromSettings();
	}, [initConsentMode, updateConsentFromSettings]);

	// ##############################
	// #endregion
	// ##############################

	// ##############################
	// #region Event handler
	// ##############################

	const onPersonalizeClick = useCallback(() => {
		pendingCategoryEnabled.current = {};
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

	const setCategoryCookie = useCallback(
		(category: Record<string, any>, accepted = false) => {
			Cookies.set(
				`${COOKIE_NAME}_${category.id}_accepted`,
				accepted ? ACCEPTED_VALUE : REFUSED_VALUE,
				COOKIES_OPTIONS
			);

			if (category.services) {
				category.services.forEach((name: string) => {
					services.current = {
						...services.current,
						[name]: accepted,
					};
				});

				setGdprServices(services.current); // Needs to be set from a ref to avoid overriding state that wasn't updated yet
			}
		},
		[setGdprServices]
	);

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
		Cookies.set(`${COOKIE_NAME}_banner`, 'dismiss', COOKIES_OPTIONS);

		// Persist buffered category changes
		Object.entries(pendingCategoryEnabled.current).forEach(
			([id, enabled]) => {
				const cat = gdprConfigs.categories.find((c) => c.id === id);
				if (cat) setCategoryCookie(cat as any, Boolean(enabled));
			}
		);
		pendingCategoryEnabled.current = {};

		updateConsentFromSettings();
	}, [setCategoryCookie]);

	const onCategoryChange: GdprModalProps['onCategoryChange'] = useCallback(
		({ enabled, id }) => {
			// Store the pending category changes to be persisted when the modal is saved
			pendingCategoryEnabled.current = {
				...pendingCategoryEnabled.current,
				[id]: enabled,
			};
		},
		[]
	);

	// ##############################
	// #endregion
	// ##############################

	const acceptAll = useCallback(() => {
		setBannerDismissed(true);
		Cookies.set(`${COOKIE_NAME}_banner`, 'dismiss', COOKIES_OPTIONS);
		gdprConfigs.categories.forEach((cat) => {
			setCategoryCookie(cat, true);
			modalRef.current?.setCategoryEnabled(cat, true);
		});

		updateConsentFromSettings();
	}, [setCategoryCookie]);

	const rejectAll = useCallback(() => {
		setBannerDismissed(true);
		Cookies.set(`${COOKIE_NAME}_banner`, 'dismiss', COOKIES_OPTIONS);
		gdprConfigs.categories.forEach((cat) => {
			setCategoryCookie(cat, false);
			modalRef.current?.setCategoryEnabled(cat, false);
		});

		updateConsentFromSettings();
	}, [setCategoryCookie]);

	// TODO :: Move to category file ??
	const getCategoriesSettings = useCallback(() => {
		return gdprConfigs.categories.map((cat) => {
			const cookie = Cookies.get(`${COOKIE_NAME}_${cat.id}_accepted`);
			const enabled = cookie === ACCEPTED_VALUE;

			return { ...cat, enabled };
		});
	}, []);

	useEffect(() => {
		const hasCookies = Cookies.get(`${COOKIE_NAME}_banner`) === 'dismiss';
		setBannerDismissed(hasCookies);

		window.addEventListener('hashchange', onHashChange);

		return () => {
			window.removeEventListener('hashchange', onHashChange);
		};
	}, [onHashChange]);

	// Set categories (triggered everytime the locale changes)
	useEffect(() => {
		const cats = getCategoriesSettings();
		setCategories(cats);

		// Initialize services map from persisted cookies on first load
		if (!didInitServicesFromCookies.current) {
			cats.forEach((cat) =>
				setCategoryCookie(cat as any, Boolean(cat.enabled))
			);
			didInitServicesFromCookies.current = true;
		}
	}, [locale, getCategoriesSettings]);

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
