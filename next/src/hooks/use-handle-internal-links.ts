import { MouseEvent } from 'react';
import { useRouter } from 'next/navigation';

// handle user-generated links with next/router
const useHandleInternalLinks = () => {
	const router = useRouter();

	return (e: MouseEvent<HTMLElement>) => {
		const target = e?.target as Element;
		const targetLink = target?.closest('a');
		// bail early if no anchor was clicked or href is not relative
		if (!targetLink?.getAttribute('href')?.startsWith('/')) return;
		// bail early if anchor has a target attribute
		if (
			targetLink?.getAttribute('target') &&
			targetLink?.getAttribute('target') !== '_self'
		)
			return;
		// bail early if anchor has a download attribute
		if (targetLink?.hasAttribute('download')) return;
		// bail early if anchor is already a next/link
		if (targetLink?.hasAttribute('data-next-link')) return;

		e.preventDefault();
		document.documentElement.style.scrollBehavior = 'auto';

		router.push(`${targetLink.href}`);

		if (!targetLink.hasAttribute('data-no-scrollreset')) {
			window.scrollTo({
				left: 0,
				top: 0,
			});
		}
		document.documentElement.style.scrollBehavior = '';
	};
};

export default useHandleInternalLinks;
