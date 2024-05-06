'use client';

import debounce from 'lodash/debounce';
import { useCallback, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

import { useTranslation } from '@/hooks/use-translation';

import './styles.css';

interface PreviewToolbarProps {
	isDraft: boolean;
	editLink?: string;
}

export function PreviewToolbar({ isDraft, editLink }: PreviewToolbarProps) {
	const [viewport, setViewport] = useState<{ w: number; h: number }>();
	const [isDraftPreview, setIsDraftPreview] = useState(isDraft);

	const __t = useTranslation();

	const getViewportSizes = useCallback(
		() => ({
			w: document.documentElement.clientWidth,
			h: document.documentElement.clientHeight,
		}),
		[]
	);

	/**
	 * Debounced resize handler
	 * to limit number of viewport size
	 * state changes and improve perfs
	 */
	const debouncedResize = useCallback(
		() => debounce(() => setViewport(getViewportSizes()), 100),
		[getViewportSizes]
	);

	useEffect(() => {
		setViewport(getViewportSizes());
		window.addEventListener('resize', debouncedResize);
		return () => window.removeEventListener('resize', debouncedResize);
	}, [getViewportSizes, debouncedResize]);

	const toggleIsDraftPreview = useCallback(() => {
		// Toggle cookie value
		Cookies.set('preview-draft', isDraftPreview ? 'false' : 'true');

		setIsDraftPreview(!isDraftPreview);

		// Reload the page
		window.location.reload();
	}, [isDraftPreview]);

	return (
		<div className="supt-preview-toolbar">
			<p>{__t('preview-toolbar-title', 'This page is a preview.')}</p>

			<label className="supt-preview-toolbar__checkbox">
				<input
					type="checkbox"
					id="preview_current_page"
					checked={!isDraftPreview}
					onChange={toggleIsDraftPreview}
				/>
				{__t('preview-toolbar-switch-draft', 'Switch to current page')}
			</label>

			<p className="supt-preview-toolbar__screen">
				{__t('preview-toolbar-screen-width', 'Screen width:')}{' '}
				<span>{`${viewport?.w ? `${viewport?.w}px` : '...'}`}</span>
			</p>

			{editLink && (
				<a
					href={decodeURI(editLink).replace('&amp;', '&')}
					className="supt-preview-toolbar__button"
				>
					{__t('preview-toolbar-back-editor', 'Back to editor')}
				</a>
			)}
		</div>
	);
}
