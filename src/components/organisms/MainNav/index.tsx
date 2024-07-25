'use client';

import cx from 'classnames';
import { usePathname } from 'next/navigation';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

import configs from '@/configs.json';
import { Link } from '@/helpers/Link';
import { useTranslation } from '@/hooks/use-translation';

import { Image } from '../../molecules/Image';
import block from './block.json';

import './styles.css';

const NAV_MOBILE_BREAKPOINT = 600;

export interface MainNavProps {
	menus: {
		header: { items: MenuItemType[] };
	};
	siteTitle: string;
	logo?: Omit<ImageProps, 'alt'> & { alt?: string };
}

export const MainNav: FC<MainNavProps> & BlockConfigs = ({
	menus,
	siteTitle,
	logo,
}) => {
	const locale = configs.staticLang; // TODO :: HANDLE THIS !!!

	const __t = useTranslation();

	const pathname = usePathname();

	// refs
	const siteNavigationRef = useRef(null);
	const siteNavigationInnerRef = useRef(null);
	const logoRef = useRef(null);
	const navRef = useRef(null);
	const navMobileRef = useRef(null);
	const toggleRef = useRef(null);

	// state
	const [isSmall, setIsSmall] = useState(true);
	const [isOpened, setIsOpened] = useState(false);

	// callbacks
	const closeNav = useCallback(() => {
		setIsOpened(false);
	}, []);
	const openNav = useCallback(() => {
		setIsOpened(true);
	}, []);

	// Calculate if the nav fits in the screen (desktop) or if it's too large (mobile)
	const handleNavFit = useCallback(() => {
		if (
			!window ||
			!navRef.current ||
			!siteNavigationInnerRef.current ||
			!logoRef.current
		)
			return;

		const logo: HTMLAnchorElement = logoRef.current;
		const nav: HTMLElement = navRef.current;
		const navInner: HTMLDivElement = siteNavigationInnerRef.current;

		const navInnerStyle = navInner
			? window.getComputedStyle(navInner)
			: null;

		const paddingLeft = parseInt(
			navInnerStyle?.getPropertyValue('padding-left') || '0'
		);
		const paddingRight = parseInt(
			navInnerStyle?.getPropertyValue('padding-right') || '0'
		);
		const xPadding = paddingLeft + paddingRight;
		const navigationWidth = navInner.offsetWidth - xPadding;
		const contentWidth = logo?.offsetWidth + nav?.offsetWidth;
		const contentFits = navigationWidth > contentWidth;

		setIsSmall(
			window.innerWidth < NAV_MOBILE_BREAKPOINT ? true : !contentFits
		);

		// If desktop => close mobile nav
		if (contentFits) {
			setTimeout(() => {
				closeNav();
			}, 250);
		}

		// // if mobile calculate height of mobile nav
		// if (window.innerWidth < NAV_MOBILE_BREAKPOINT || !contentFits) {
		// 	if (!navMobileRef.current) return;
		// 	const navMobile: HTMLElement = navMobileRef.current;

		// 	const navMobileHeight = window.innerHeight - navInner.offsetHeight;
		// 	navMobile.style.height = navMobileHeight + 'px';
		// }
	}, [closeNav]);

	useEffect(() => {
		handleNavFit(); // Init

		const handleWindowResize = () => {
			handleNavFit();
		};

		window.addEventListener('resize', handleWindowResize);

		return () => {
			window.removeEventListener('resize', handleWindowResize);
		};
	}, [handleNavFit]);

	useEffect(() => {
		closeNav();
	}, [pathname, closeNav]);

	// block document scroll when menu is open
	useEffect(() => {
		if (isSmall && isOpened) {
			document.documentElement.style.overflow = 'hidden';
		} else {
			document.documentElement.style.overflow = '';
		}

		// cleanup
		return () => {
			document.documentElement.style.overflow = '';
		};
	}, [isSmall, isOpened]);

	/**
	 * Close the nav when pressing ESC key
	 */
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (!['Escape', 'Esc'].includes(e?.key)) return;
			closeNav();
		};
		document.body.addEventListener('keydown', handler);

		// clean up function
		return () => {
			document.body.removeEventListener('keydown', handler);
		};
	}, [closeNav]);

	return (
		<div
			ref={siteNavigationRef}
			className={cx('supt-main-nav', {
				'-is-opened': isOpened,
				'-is-small': isSmall,
			})}
		>
			<div ref={siteNavigationInnerRef} className="supt-main-nav__inner">
				<Link
					href={configs.isMultilang ? `/${locale}/` : '/'}
					className="supt-main-nav__logo"
					ref={logoRef}
					aria-label={siteTitle}
				>
					{logo ? (
						<Image
							src={logo.src}
							width={logo.width}
							height={logo.height}
							priority
							className="supt-main-nav__logo__img"
							alt={siteTitle}
						/>
					) : null}
				</Link>
				{menus?.header?.items?.length ? (
					<>
						<nav ref={navRef} className="supt-main-nav__nav">
							{menus.header.items.map(
								(
									{ label, path, cssClasses, ...linkProps },
									i
								) => {
									return (
										<Link
											key={i}
											href={path}
											tabIndex={isSmall ? -1 : 0}
											suppressHydrationWarning
											className={cx(
												'supt-main-nav__nav__item',
												cssClasses,
												{
													'-is-current':
														pathname === path,
												}
											)}
											{...(linkProps as any)}
										>
											{label}
										</Link>
									);
								}
							)}
						</nav>
						<button
							ref={toggleRef}
							className="supt-main-nav__toggle"
							aria-label={
								isOpened
									? __t(
											'main-nav-close-menu-label',
											'Fermer le menu'
										)
									: __t(
											'main-nav-open-menu-label',
											'Ouvrir le menu'
										)
							}
							aria-expanded={
								isSmall && isOpened ? 'true' : 'false'
							}
							aria-controls="small_menu_nav"
							onClick={() => {
								isOpened ? closeNav() : openNav();
							}}
						>
							<span
								className="supt-main-nav__toggle__icon"
								aria-hidden="true"
							>
								<span className="supt-main-nav__toggle__bar" />
							</span>
						</button>
					</>
				) : null}
			</div>
			{menus?.header?.items?.length ? (
				<nav
					id="small_menu_nav"
					role="menubar"
					ref={navMobileRef}
					className="supt-main-nav__nav-small"
				>
					{menus.header.items.map(
						({ label, path, cssClasses, ...linkProps }, i) => {
							return (
								<Link
									key={i}
									href={path}
									suppressHydrationWarning
									className={cx(
										'supt-main-nav__nav-small__item',
										cssClasses,
										{
											'-is-current': pathname === path,
										}
									)}
									tabIndex={isOpened ? 0 : -1}
									role="menuitem"
									{...(linkProps as any)}
								>
									{label}
								</Link>
							);
						}
					)}
				</nav>
			) : null}
		</div>
	);
};

MainNav.slug = block.slug;
MainNav.title = block.title;
