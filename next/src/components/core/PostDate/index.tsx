'use client';

import { useLayoutEffect, useState } from 'react';

import cx from 'classnames';

import { formatHumanDiff, formatWithPhpDatePattern } from './format-post-date';

import './styles.css';

export default function PostDate({
	className,
	textAlign,
	style,
	isLink,
	linkTarget,
	renderEmpty,
	/** Resolved instant from `getData` (GraphQL / bindings). */
	machineDatetime,
	/** Block attribute from WordPress when present in merged props. */
	datetime,
	permalink,
	showModifiedClass,
	isHumanDiff,
	phpDatePattern,
}: PostDateProps) {
	const instant =
		(typeof machineDatetime === 'string' && machineDatetime.trim()) ||
		(typeof datetime === 'string' && datetime.trim()) ||
		'';

	const [visibleLabel, setVisibleLabel] = useState('');

	// Derive visible text on the client after mount: browser TZ + hydration match (SSR label is '').
	/* eslint-disable react-hooks/set-state-in-effect -- no external store; formatting needs `window`/local time */
	useLayoutEffect(() => {
		if (!instant) {
			setVisibleLabel('');
			return;
		}
		if (isHumanDiff) {
			setVisibleLabel(formatHumanDiff(instant));
			return;
		}
		setVisibleLabel(
			formatWithPhpDatePattern(instant, phpDatePattern || 'Y-m-d')
		);
	}, [instant, isHumanDiff, phpDatePattern]);
	/* eslint-enable react-hooks/set-state-in-effect */

	if (renderEmpty || !instant) {
		return null;
	}

	const hasLinkColor = Boolean(style?.elements?.link?.color?.text);

	const timeEl = (
		<time dateTime={instant} suppressHydrationWarning>
			{visibleLabel}
		</time>
	);

	const inner =
		isLink && permalink ? (
			<a href={permalink} target={linkTarget}>
				{timeEl}
			</a>
		) : (
			timeEl
		);

	return (
		<div
			className={cx(
				'wp-block-post-date',
				showModifiedClass && 'wp-block-post-date__modified-date',
				textAlign && `has-text-align-${textAlign}`,
				hasLinkColor && 'has-link-color',
				className
			)}
		>
			{inner}
		</div>
	);
}
