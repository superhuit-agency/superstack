'use client';

import cx from 'classnames';
import { usePathname } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

import { useLocale } from '@/contexts/locale-context';
import { Link } from '@/components/atoms/Link';

import './styles.css';

export const LangSwitcher: FC = () => {
	const { locale } = useLocale();
	const pathname = usePathname();

	const [translatedPathnames, setTranslatedPathnames] = useState<
		{ href: string; lang: string }[]
	>([]);

	/**
	 * Get alternate links from document to get the translated pathnames
	 * Each time the pathname changes, the translated pathnames are updated
	 */
	useEffect(() => {
		const alternateLinks = Array.from(
			document.querySelectorAll('link[rel="alternate"]')
		);

		const translatedPathnames = alternateLinks.map((link) => {
			return {
				href:
					link
						.getAttribute('href')
						?.replace(window.location.origin, '') || '',
				lang:
					link
						.getAttribute('hreflang')
						?.split('-')[0]
						?.split('_')[0] || '',
			};
		});

		setTranslatedPathnames(translatedPathnames);
	}, [pathname]);

	return translatedPathnames?.length > 1 ? (
		<div className="supt-lang-switcher">
			{translatedPathnames?.map(({ href, lang }) => (
				<Link
					key={lang}
					href={href || ''}
					className={cx('supt-lang-switcher__item', {
						'-is-current': lang === locale,
					})}
				>
					{lang}
				</Link>
			))}
		</div>
	) : null;
};
