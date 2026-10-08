// @vitest-environment happy-dom
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { baseUriContext } from '@/hooks/use-base-uri';
import { setUpRoot } from '@/test-utils/render-pages';

import { getData } from './data';
import PostTimeToRead from '.';

vi.mock('@/hooks/use-base-uri', () => ({
	baseUriContext: vi.fn(() => '/hello-world/'),
}));

const postOfWords = (words: number) => ({
	nodeByUri: {
		__typename: 'Post',
		databaseId: 42,
		rawContent: Array(words).fill('word').join(' '),
	},
});

describe('PostTimeToRead', () => {
	const test = setUpRoot();

	/** Renders the block the way a page does: its attributes merged with its data */
	async function render(
		attributes: PostTimeToReadAttributes,
		nodeByUri: unknown
	) {
		const fetcher = vi.fn().mockResolvedValue(nodeByUri);
		const data = await getData(
			fetcher as unknown as FetchApiFuncType,
			attributes
		);

		act(() =>
			test.root.render(<PostTimeToRead {...attributes} {...data} />)
		);

		return data;
	}

	it('renders nothing without a Base URI', async () => {
		vi.mocked(baseUriContext).mockReturnValueOnce(undefined);

		await render({}, null);

		expect(test.container.innerHTML).toBe('');
	});

	it.each([
		['time', {}],
		['words', { displayMode: 'words' }],
	] as const)(
		'renders nothing in %s mode when no post is at the Base URI',
		async (_mode, attributes) => {
			const data = await render(attributes, { nodeByUri: null });

			expect(test.container.innerHTML).toBe('');
			expect(data.cacheTags).toEqual(['uris']);
		}
	);

	it('reads a one-minute post as "1 minute"', async () => {
		await render({}, postOfWords(150));

		expect(test.container.textContent).toBe('1 minute');
	});

	it('reads a longer post in minutes', async () => {
		await render({}, postOfWords(189 * 3));

		expect(test.container.textContent).toBe('3 minutes');
	});
});
