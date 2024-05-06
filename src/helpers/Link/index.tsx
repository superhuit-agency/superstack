import { FC, forwardRef } from 'react';
import NextLink from 'next/link';

import { LinkProps } from '@/typings';

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
	(
		{
			href = '',
			children,
			scroll = true,
			prefetch = false,
			download = false,
			...props
		},
		ref
	) => {
		const linkProps: any = {
			...props,
			ref,
		};

		// Return a button if there is no href
		if (!href) {
			return <button {...linkProps}>{children}</button>;
		}

		// Don't return next/link if it's an anchor or an mailto/tel link
		if (
			href.startsWith('#') ||
			href.startsWith('mailto:') ||
			href.startsWith('tel:')
		) {
			return (
				<a href={href} {...linkProps}>
					{children}
				</a>
			);
		}

		// Don't return next/link if it's a file to download (only if domain name isn't external)
		if (
			download ||
			(href.startsWith('/') &&
				(href.endsWith('.pdf') || href.endsWith('.zip')))
		) {
			return (
				<a href={href} {...linkProps} download target={undefined}>
					{children}
				</a>
			);
		}

		// If it links to an external domain name or has target _blank, open in a new tab + add rel to improve performance / prevent security vulnerabilities
		if (linkProps.target === '_blank' || !href.startsWith('/')) {
			return (
				<a
					href={href}
					{...linkProps}
					target="_blank"
					rel="noopener noreferrer"
				>
					{children}
				</a>
			);
		}

		return (
			<NextLink
				href={href}
				scroll={scroll}
				prefetch={prefetch}
				{...linkProps}
				data-next-link
			>
				{children}
			</NextLink>
		);
	}
);

Link.displayName = 'Link';
