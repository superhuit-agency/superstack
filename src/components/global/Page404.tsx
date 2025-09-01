'use client';

import { useParams } from 'next/navigation';
import { FC } from 'react';

import configs from '@/configs.json';
import { LocaleProvider } from '@/contexts/locale-context';

import { Gdpr } from '../molecules';
import { Footer, MainNav, Section404 } from '../organisms';

import { Container } from './Container';


interface Page404Props {
	mainNavProps?: MainNavProps | null;
	footerProps?: FooterProps | null;
	dictionaries: Record<Locale, any>;
	defaultLocale: Locale;
}

const Page404Wrapper = ({
	children,
	defaultLocale,
	locale,
	dictionaries,
}: {
	children: React.ReactNode;
	defaultLocale: Locale;
	locale: Locale;
	dictionaries: Record<Locale, any>;
}) =>
	configs.isMultilang ? (
		<LocaleProvider
			locale={locale}
			dictionary={dictionaries[locale] || dictionaries[defaultLocale]}
		>
			{children}
		</LocaleProvider>
	) : (
		children
	);

export const Page404: FC<Page404Props> = ({
	mainNavProps,
	footerProps,
	dictionaries,
	defaultLocale,
}) => {
	const params = useParams();

	return (
		<Page404Wrapper
			locale={params.lang as Locale}
			defaultLocale={defaultLocale}
			dictionaries={dictionaries}
		>
			<MainNav
				{...mainNavProps}
				menus={configs.isMultilang ? undefined : mainNavProps?.menus}
			/>
			<div className="main">
				<Container className="supt-single-page">
					<Section404 />
				</Container>
			</div>
			{!configs.isMultilang && footerProps ? (
				<Footer {...footerProps} />
			) : null}
			<Gdpr />
		</Page404Wrapper>
	);
};
