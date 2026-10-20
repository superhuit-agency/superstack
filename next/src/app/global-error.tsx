'use client';

import { ErrorPage } from '@/components/global/ErrorPage';
import { useLocale } from '@/contexts/locale-context';

import '@/css/base/index.css';

// Replaces the root layout when it fails, so it renders its own document. Its
// `LocaleProvider` failed with it: `useLocale()` falls back to the default locale.
export default function GlobalError({
	error,
	unstable_retry,
}: {
	error: Error & { digest?: string };
	unstable_retry: () => void;
}) {
	const { locale } = useLocale();

	return (
		<html lang={locale}>
			<head>
				<link rel="stylesheet" href="/css/theme-generated.css" />
			</head>
			<body>
				<ErrorPage error={error} retry={unstable_retry} />
			</body>
		</html>
	);
}
