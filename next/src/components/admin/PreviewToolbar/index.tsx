'use client';

import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

import './styles.css';

export default function PreviewToolbar({
	isDraft,
	editLink,
}: PreviewToolbarProps) {
	const [viewport, setViewport] = useState<{ w: number; h: number }>();
	const [isDraftPreview, setIsDraftPreview] = useState(isDraft);

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
			<p>Preview Toolbar</p>

			<label className="supt-preview-toolbar__checkbox">
				<input
					type="checkbox"
					id="preview_current_page"
					checked={!isDraftPreview}
					onChange={toggleIsDraftPreview}
				/>
				Switch Draft
			</label>

			<p className="supt-preview-toolbar__screen">
				Screen Width{' '}
				<span>{`${viewport?.w ? `${viewport?.w}px` : '...'}`}</span>
			</p>

			{editLink && (
				<a
					href={decodeURI(editLink).replace('&amp;', '&')}
					className="supt-preview-toolbar__button"
				>
					Back Editor
				</a>
			)}
		</div>
	);
}
