'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import Script from 'next/script';

import { useLocale } from '@/contexts/locale-context';
import gdprConfigs from '@/gdpr-configs.json';

import { GdprBanner } from './GdprBanner';
import { GdprModal, GdprModalProps } from './GdprModal';
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
	const [categories, setCategories] = useState<Record<string, any>[]>([]);
	const [bannerDismissed, setBannerDismissed] = useState(true);
	const [gdprServices, setGdprServices] = useState<Record<string, boolean>>(
		{}
	);

	const { locale } = useLocale();

	const services = useRef({});

	const modalRef = useRef<{
		open: () => {};
		setCategoryEnabled: (
			category: Record<string, any>,
			enabled: boolean
		) => {};
	}>(null);

	// ##############################
	// #region Event handler
	// ##############################

	const onPersonalizeClick = useCallback(() => {
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
		Cookies.set(`${COOKIE_NAME}_banner`, 'dismiss', COOKIES_OPTIONS);
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

	const acceptAll = useCallback(() => {
		setBannerDismissed(true);
		Cookies.set(`${COOKIE_NAME}_banner`, 'dismiss', COOKIES_OPTIONS);
		gdprConfigs.categories.forEach((cat) => {
			setCategoryCookie(cat, true);
			modalRef.current?.setCategoryEnabled(cat, true);
		});
	}, [setCategoryCookie]);

	const rejectAll = useCallback(() => {
		setBannerDismissed(true);
		Cookies.set(`${COOKIE_NAME}_banner`, 'dismiss', COOKIES_OPTIONS);
		gdprConfigs.categories.forEach((cat) => {
			setCategoryCookie(cat, false);
			modalRef.current?.setCategoryEnabled(cat, false);
		});
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
			{gdprServices?.gtm ? (
				<>
					<Script
						id="gtm-script"
						dangerouslySetInnerHTML={{
							__html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
	new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
	j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
	'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
	})(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_KEY}');`,
						}}
					/>
				</>
			) : null}
		</>
	);
};

Gdpr.slug = block.slug;
Gdpr.title = block.title;
