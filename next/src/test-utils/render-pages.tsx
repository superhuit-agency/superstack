import { Activity, act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach } from 'vitest';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

/**
 * Gives each test its own React root, in a container attached to the document
 */
export function setUpRoot() {
	const test = {} as { container: HTMLDivElement; root: Root };

	beforeEach(() => {
		test.container = document.createElement('div');
		document.body.appendChild(test.container);
		test.root = createRoot(test.container);
	});

	afterEach(() => {
		act(() => test.root.unmount());
		test.container.remove();
	});

	return test;
}

/**
 * Renders the pages the user visited the way Cache Components do: the pages
 * left are hidden in an <Activity>, not unmounted.
 */
export function renderPages(
	root: Root,
	visitedPages: string[],
	currentPage: string,
	renderPage: (page: string) => ReactNode
) {
	act(() =>
		root.render(
			<>
				{visitedPages.map((page) => (
					<Activity
						key={page}
						mode={page === currentPage ? 'visible' : 'hidden'}
					>
						{renderPage(page)}
					</Activity>
				))}
			</>
		)
	);
}
