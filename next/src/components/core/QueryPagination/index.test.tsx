// @vitest-environment happy-dom
import { act } from 'react';
import { describe, expect, it } from 'vitest';

import { setUpRoot } from '@/test-utils/render-pages';

import QueryPaginationNext from '../QueryPaginationNext';
import QueryPaginationNumbers from '../QueryPaginationNumbers';
import QueryPaginationPrevious from '../QueryPaginationPrevious';
import QueryPagination from '.';

type InjectedPagination = {
	currentPage: number;
	totalPages: number | null;
	previousHref: string | null;
	nextHref: string | null;
};

describe('QueryPagination', () => {
	const test = setUpRoot();

	/**
	 * Renders a pagination with its previous, numbers and next blocks, given
	 * what the parent `core/query` injected into them, if anything
	 */
	function render(injected?: InjectedPagination) {
		act(() =>
			test.root.render(
				<QueryPagination
					level={0}
					paginationArrow="none"
					showLabel={true}
				>
					<QueryPaginationPrevious
						{...(injected && {
							href: injected.previousHref,
							totalPages: injected.totalPages,
						})}
					/>
					<QueryPaginationNumbers
						{...(injected && {
							currentPage: injected.currentPage,
							totalPages: injected.totalPages,
							baseUri: '/blog/',
						})}
					/>
					<QueryPaginationNext
						{...(injected && {
							href: injected.nextHref,
							totalPages: injected.totalPages,
						})}
					/>
				</QueryPagination>
			)
		);
	}

	const links = () =>
		Array.from(test.container.querySelectorAll('a')).map(
			(link) => link.textContent
		);

	it('renders nothing in a loop that does not paginate', () => {
		// A loop not inheriting the query gets nothing injected
		render();

		expect(
			test.container.querySelector('.wp-block-query-pagination')!
				.innerHTML
		).toBe('');
	});

	it('renders nothing when the loop fits on one page', () => {
		render({
			currentPage: 1,
			totalPages: 1,
			previousHref: null,
			nextHref: null,
		});

		expect(
			test.container.querySelector('.wp-block-query-pagination')!
				.innerHTML
		).toBe('');
	});

	it('links the next page when the total is unknown', () => {
		render({
			currentPage: 1,
			totalPages: null,
			previousHref: null,
			nextHref: '/blog/page/2/',
		});

		expect(links()).toEqual(['Next Page']);
	});

	it('links the previous, numbered and next pages', () => {
		render({
			currentPage: 2,
			totalPages: 3,
			previousHref: '/blog/',
			nextHref: '/blog/page/3/',
		});

		expect(links()).toEqual(['Previous Page', '1', '3', 'Next Page']);
	});
});
