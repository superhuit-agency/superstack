import { getLocales } from '@/i18n/get-locales';
import { getDictionaries } from '@/i18n/dictionaries';

import * as footerData from '@/components/organisms/Footer/data';
import * as mainNavData from '@/components/organisms/MainNav/data';
import { Page404 } from '@/components/global/Page404';

async function NotFoundPage() {
	const { defaultLocale } = await getLocales();

	const dictionaries = await getDictionaries();

	const [navPromise, footerPromise] = await Promise.allSettled([
		mainNavData.getData(defaultLocale),
		footerData.getData(defaultLocale),
	]);

	const mainNavProps =
		navPromise.status === 'fulfilled' ? navPromise.value : null;
	const footerProps =
		footerPromise.status === 'fulfilled' ? footerPromise.value : null;

	return (
		<Page404
			mainNavProps={mainNavProps}
			footerProps={footerProps}
			dictionaries={dictionaries}
		/>
	);
}

export default NotFoundPage;
