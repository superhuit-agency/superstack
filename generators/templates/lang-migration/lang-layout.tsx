import { getDictionary } from '@/i18n/dictionaries';
import { LocaleProvider } from '@/contexts/locale-context';

export const revalidate = 3600;

export default async function Layout({
	params,
	children,
}: {
	children: React.ReactNode;
	params: Promise<{ lang: string }>;
}) {
	const { lang } = await params;
	const dictionary = await getDictionary(lang as Locale);

	return (
		<LocaleProvider locale={lang as Locale} dictionary={dictionary}>
			{children}
		</LocaleProvider>
	);
}
