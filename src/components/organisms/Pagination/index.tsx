import { FC, useCallback } from 'react';
import cx from 'classnames';

import { useTranslation } from '@/hooks/use-translation';
import { BlockConfigs } from '@/typings';
import block from './block.json';

import './styles.css';

export type PaginationProps = {
	baseUri: string;
	currentPagination: number;
	totalPages: number;
};

export const Pagination: FC<PaginationProps> & BlockConfigs = ({
	baseUri,
	currentPagination,
	totalPages,
}) => {
	const __t = useTranslation();

	const pageItem = useCallback(
		(page: number) => {
			return (
				<li key={page}>
					<a
						href={
							page === 1
								? baseUri
								: baseUri + 'page/' + page + '/'
						}
						className={cx('supt-pagination__link', {
							'-is-active': currentPagination === page,
						})}
						aria-label={
							__t('pagination-go-to-aria-label', 'Go to page') +
							' ' +
							page
						}
						aria-current={
							page === currentPagination ? true : undefined
						}
					>
						{page}
					</a>
				</li>
			);
		},
		[baseUri, currentPagination, __t]
	);

	return (
		<div className="supt-pagination">
			<a
				href={
					currentPagination <= 2
						? baseUri
						: baseUri + 'page/' + (currentPagination - 1) + '/'
				}
				className={cx('supt-pagination__link', '-is-prev', {
					'-is-disabled': currentPagination <= 1,
				})}
				rel={currentPagination <= 1 ? undefined : 'prev'}
			>
				<svg width="6" height="10" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M1 .7574 5.2426 5 1 9.2426"
						fill="none"
						fillRule="evenodd"
					/>
				</svg>
				<span>{__t('pagination-previous', 'Previous')}</span>
			</a>
			<nav
				role="navigation"
				aria-label={__t(
					'pagination-aria-label',
					'Pagination navigation'
				)}
			>
				<ul>
					{Array.from({ length: totalPages }, (_, i) => i + 1).map(
						(page) => {
							if (page === 1 || page === totalPages)
								return pageItem(page);
							else {
								// current pagination is 3 firsts => show 5 first page numbers then "..."
								if (currentPagination <= 3) {
									if (page <= 5) return pageItem(page);
									else if (page === 6)
										return (
											<li key={page}>
												<span>...</span>
											</li>
										);
								}
								// current pagination is 3 lasts => show "..." then 5 last page numbers
								if (currentPagination > totalPages - 3) {
									if (page > totalPages - 5)
										return pageItem(page);
									else if (page === totalPages - 5)
										return (
											<li key={page}>
												<span>...</span>
											</li>
										);
								}
								// others => always show 2 page number before and 2 page numbers after current pagination rounded by "..."
								else {
									if (
										page === currentPagination - 2 ||
										page === currentPagination - 1 ||
										page === currentPagination ||
										page === currentPagination + 1 ||
										page === currentPagination + 2
									)
										return pageItem(page);
									else if (
										page === currentPagination - 3 ||
										page === currentPagination + 3
									)
										return (
											<li key={page}>
												<span>...</span>
											</li>
										);
								}
							}
						}
					)}
				</ul>
			</nav>
			<a
				href={baseUri + 'page/' + (currentPagination + 1) + '/'}
				className={cx('supt-pagination__link', '-is-next', {
					'-is-disabled': currentPagination >= totalPages,
				})}
				rel={currentPagination >= totalPages ? undefined : 'next'}
			>
				<span>{__t('pagination-next', 'Next')}</span>
				<svg width="6" height="10" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M1 .7574 5.2426 5 1 9.2426"
						fill="none"
						fillRule="evenodd"
					/>
				</svg>
			</a>
		</div>
	);
};

Pagination.slug = block.slug;
Pagination.title = block.title;
