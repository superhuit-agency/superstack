'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import gdprConfigs from '@/gdpr-configs.json';

import { GdprBanner } from './GdprBanner';
import {
	GdprModal,
	type GdprModalHandle,
	type GdprModalProps,
} from './GdprModal';
import {
	categories as categoriesConfigs,
	createConsentUpdater,
	dismissBanner,
	getCategoriesSettings,
	isBannerDismissed,
	setCategoryAccepted,
	type GdprCategoryType,
} from './consent';

/**
 * COMPONENT
 */
export default function Gdpr() {
	const [categories, setCategories] = useState<GdprCategoryType[]>([]);
	const [bannerDismissed, setBannerDismissed] = useState(true);
	const [updateConsent] = useState(() => createConsentUpdater());

	const pendingCategoryEnabled = useRef<Record<string, boolean>>({});
	const modalRef = useRef<GdprModalHandle>(null);

	// ##############################
	// #region Event handler
	// ##############################

	const onPersonalizeClick = useCallback(() => {
		pendingCategoryEnabled.current = {};
		modalRef.current?.open();
	}, []);

	const onHashChange = useCallback((event: HashChangeEvent) => {
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
		dismissBanner();

		// Persist buffered category changes
		Object.entries(pendingCategoryEnabled.current).forEach(
			([id, enabled]) => {
				if (categoriesConfigs.some((cat) => cat.id === id))
					setCategoryAccepted(id, Boolean(enabled));
			}
		);
		pendingCategoryEnabled.current = {};

		updateConsent();
	}, [updateConsent]);

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

	const setAllCategories = useCallback(
		(accepted: boolean) => {
			setBannerDismissed(true);
			dismissBanner();
			categoriesConfigs.forEach((cat) => {
				setCategoryAccepted(cat.id, accepted);
				modalRef.current?.setCategoryEnabled(cat, accepted);
			});

			updateConsent();
		},
		[updateConsent]
	);

	const acceptAll = useCallback(
		() => setAllCategories(true),
		[setAllCategories]
	);
	const rejectAll = useCallback(
		() => setAllCategories(false),
		[setAllCategories]
	);

	useEffect(() => {
		// Reflect persisted choices on first load
		updateConsent();

		// Cookies are only readable in the browser
		/* eslint-disable react-hooks/set-state-in-effect */
		setBannerDismissed(isBannerDismissed());
		setCategories(getCategoriesSettings());
		/* eslint-enable react-hooks/set-state-in-effect */
	}, [updateConsent]);

	useEffect(() => {
		window.addEventListener('hashchange', onHashChange);

		return () => {
			window.removeEventListener('hashchange', onHashChange);
		};
	}, [onHashChange]);

	return (
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
	);
}
