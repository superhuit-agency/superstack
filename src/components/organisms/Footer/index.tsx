'use client';

import cx from 'classnames';
import { FC, useMemo } from 'react';

import { useLocale } from '@/contexts/locale-context';
import { Link } from '@/helpers/Link';

import block from './block.json';

import './styles.css';

export const Footer: FC<FooterProps> & BlockConfigs = ({
	menus,
	siteTitle,
}) => {
	const { dictionary } = useLocale();

	const year = useMemo(() => new Date().getFullYear(), []);

	return (
		<footer className="supt-footer">
			<div className="supt-footer__inner">
				<div className="supt-footer__top">
					<ul className="supt-footer__menu">
						{menus.footer?.items ? (
							<>
								{menus.footer.items.map(
									(
										{
											label,
											path,
											cssClasses,
											...linkProps
										},
										i
									) => (
										<li key={i}>
											<Link
												href={path}
												suppressHydrationWarning
												className={cx(cssClasses)}
												{...(linkProps as any)}
											>
												{label}
											</Link>
										</li>
									)
								)}
							</>
						) : null}
					</ul>
					<ul className="supt-footer__legal">
						{menus.legal?.items ? (
							<>
								{menus.legal.items.map(
									(
										{
											label,
											path,
											cssClasses,
											...linkProps
										},
										i
									) => (
										<li key={i}>
											<Link
												href={path}
												suppressHydrationWarning
												className={cx(cssClasses)}
												{...(linkProps as any)}
											>
												{label}
											</Link>
										</li>
									)
								)}
							</>
						) : null}
					</ul>
					<ul className="supt-footer__social">
						{menus.social?.items &&
							menus.social.items.map(
								(
									{ label, path, cssClasses, ...linkProps },
									i
								) => (
									<li key={i}>
										<Link
											href={path}
											className={cx(
												'supt-footer__social__icon',
												cssClasses
											)}
											{...(linkProps as any)}
										>
											{label}
										</Link>
									</li>
								)
							)}
					</ul>
				</div>
				<div className="supt-footer__bottom">
					<div className="supt-footer__copyright">
						© {year} {siteTitle}
					</div>
					<div className="supt-footer__credits">
						{dictionary.footer?.madeBy}{' '}
						<a
							className="supt-footer__logo"
							href="https://superhuit.ch"
							target="_blank"
						>
							<svg
								width="106"
								height="32"
								viewBox="0 0 106 30"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M105.991 0v31.589H0V0h105.991zm-1.82 1.82H1.821v27.948h102.35V1.82zm-87.809 9.251c.648 0 1.24.093 1.778.278.537.185 1.07.482 1.598.889l-1 1.625a4.624 4.624 0 00-1.216-.687 3.434 3.434 0 00-1.202-.243c-.426 0-.743.076-.951.229-.209.152-.313.34-.313.562 0 .223.083.396.25.522.167.124.435.252.806.382l1.5.458c.602.158 1.084.354 1.445.59.361.237.627.514.799.834.17.32.257.697.257 1.132 0 .89-.287 1.59-.862 2.105-.574.514-1.398.771-2.473.771a6.763 6.763 0 01-2.173-.368 6.893 6.893 0 01-2.063-1.132l.888-1.71c.64.473 1.228.814 1.765 1.022a4.505 4.505 0 001.639.312c.37 0 .65-.07.84-.208a.681.681 0 00.285-.584.695.695 0 00-.104-.375c-.069-.11-.197-.222-.382-.333a3.242 3.242 0 00-.778-.306l-1.25-.417c-.861-.24-1.498-.564-1.91-.972-.413-.407-.618-.958-.618-1.653 0-.5.132-.959.396-1.376.263-.416.655-.745 1.173-.986.52-.24 1.144-.36 1.876-.36zm8.002.208v5.446c0 .649.146 1.144.437 1.487.292.342.711.514 1.258.514.565 0 1-.167 1.305-.5.306-.334.459-.876.459-1.626v-5.32h2.014v5.223c0 1.306-.33 2.302-.993 2.987-.662.685-1.604 1.028-2.827 1.028-1.232 0-2.174-.327-2.827-.98-.653-.652-.98-1.627-.98-2.924v-5.335h2.154zm49.387 0v5.446c0 .649.145 1.144.437 1.487.292.342.71.514 1.257.514.565 0 1-.167 1.307-.5.305-.334.458-.876.458-1.626v-5.32h2.014v5.223c0 1.306-.331 2.302-.993 2.987-.662.685-1.605 1.028-2.827 1.028-1.232 0-2.175-.327-2.827-.98-.653-.652-.98-1.627-.98-2.924v-5.335h2.154zm-37.662 0c.74 0 1.382.128 1.924.382.541.255.951.621 1.23 1.098.277.477.416 1.035.416 1.674 0 .648-.144 1.218-.43 1.709a2.88 2.88 0 01-1.244 1.139c-.542.269-1.179.403-1.91.403h-1.487v2.625h-2.167v-9.03zm12.044 0v1.848h-4.181v1.737h3.209v1.764h-3.21v1.834h4.502v1.847h-6.654v-9.03h6.334zm6.64 0c1.084 0 1.913.214 2.487.64.575.426.862 1.032.862 1.82 0 .703-.222 1.254-.667 1.652-.445.399-1.07.598-1.875.598h-.334v.139l.292.013c.435.01.785.065 1.049.167.264.102.477.257.639.466.162.208.312.503.45.882l.863 2.653H56.26l-.764-2.57a1.264 1.264 0 00-.215-.423.78.78 0 00-.355-.237 1.855 1.855 0 00-.583-.076h-1.417v3.306h-2.167v-9.03zm8.142 0v3.585h3.862V11.28H69v9.03h-2.223v-3.613h-3.862v3.612h-2.181v-9.03h2.18zm21.074 0v9.03h-2.181v-9.03h2.18zm9.46 0v1.834h-2.653v7.196h-2.125v-7.196h-2.654V11.28h7.433zm-57.471 1.834h-1.39v2.862h1.376c.463 0 .824-.13 1.083-.389.26-.259.39-.639.39-1.14 0-.407-.13-.731-.39-.971-.26-.241-.616-.362-1.07-.362zm18.546-.083h-1.598v2.403h1.486c.491 0 .869-.104 1.133-.312.263-.209.395-.526.395-.952 0-.39-.113-.676-.34-.861-.227-.186-.586-.278-1.076-.278z"
									fillRule="evenodd"
								/>
							</svg>
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
};

Footer.slug = block.slug;
Footer.title = block.title;
