'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { sendGTMEvent } from '@next/third-parties/google';

/**
 * Pushes a `pageview` event to the dataLayer on every client-side navigation,
 * which the App Router does not trigger on its own.
 */
export const GoogleTagManagerPageview = () => {
	const pathname = usePathname();

	useEffect(() => {
		sendGTMEvent({ event: 'pageview', page_path: pathname });
	}, [pathname]);

	return null;
};
