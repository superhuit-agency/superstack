'use client';

import { ErrorPage } from '@/components/global/ErrorPage';

// Shown when a page fails to render before it was ever cached. A page cached
// before keeps serving its previous version instead.
export default function Error({
	error,
	unstable_retry,
}: {
	error: Error & { digest?: string };
	unstable_retry: () => void;
}) {
	return <ErrorPage error={error} retry={unstable_retry} />;
}
