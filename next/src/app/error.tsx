'use client';

import { ErrorPage } from '@/components/global/ErrorPage';

// Shown on a client-side navigation to a page that fails to render before it
// was ever cached (a full page load gets `src/pages/500.tsx`), and on errors in
// client components. A page cached before keeps serving its previous version.
export default function Error({
	error,
	unstable_retry,
}: {
	error: Error & { digest?: string };
	unstable_retry: () => void;
}) {
	return <ErrorPage error={error} retry={unstable_retry} />;
}
