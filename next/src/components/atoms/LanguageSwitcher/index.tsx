'use client';

import cx from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import './styles.css';

interface AlternateLink {
	hreflang: string;
	href: string;
}

function toRelativePath(rawHref: string): string {
	try {
		return new URL(rawHref).pathname;
	} catch {
		return rawHref;
	}
}

export default function LanguageSwitcher() {
	const pathname = usePathname();
	const [alternates, setAlternates] = useState<AlternateLink[]>([]);

	useEffect(() => {
		const links = Array.from(
			document.querySelectorAll<HTMLLinkElement>(
				'link[rel="alternate"][hreflang]'
			)
		);
		const next = links
			.map((el) => ({
				hreflang: el.getAttribute('hreflang') ?? '',
				href: toRelativePath(el.getAttribute('href') ?? ''),
			}))
			.filter((l) => l.hreflang && l.href);
		// Syncing external DOM state (alternate <link> tags) to React state
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setAlternates(next);
	}, [pathname]);

	if (!alternates.length) return null;

	const currentLang = pathname.split('/').filter(Boolean)[0] ?? '';

	return (
		<nav aria-label="Language switcher">
			<ul className="lang-switcher">
				{alternates.map(({ hreflang, href }) => {
					const code = hreflang.split(/[-_]/)[0].toLowerCase();
					const isActive = code === currentLang;
					return (
						<li key={hreflang}>
							<Link
								href={href}
								hrefLang={hreflang.replace('_', '-')}
								lang={hreflang.replace('_', '-')}
								aria-current={isActive ? 'true' : undefined}
								className={cx('lang-switcher__link', {
									'is-active': isActive,
								})}
							>
								{code.toUpperCase()}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
