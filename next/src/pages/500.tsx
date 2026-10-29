import Head from 'next/head';

import { ErrorPage } from '@/components/global/ErrorPage';

import '@/css/base/index.css';

// Served by `next start` on a full page load of a page that fails to render
// before it was ever cached: Next prerenders it to fill the cache, throws the
// error so the failed render isn't cached, and can only answer with a Pages
// Router 500 page (an App Router only build gets a plain-text 500). Static, so
// without the error digest, in the default locale like `global-error.tsx`.
export default function Custom500() {
	return (
		<>
			<Head>
				<link rel="stylesheet" href="/css/theme-generated.css" />
			</Head>
			<ErrorPage retry={() => window.location.reload()} />
		</>
	);
}
