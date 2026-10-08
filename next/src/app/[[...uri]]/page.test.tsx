import { notFound, permanentRedirect } from 'next/navigation';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getPublicNodeByURI, getRedirection } from '@/lib';
import Page from './page';

vi.mock('next/dynamic', () => ({ default: () => () => null }));

vi.mock('next/headers', () => ({
	draftMode: vi.fn(async () => ({ isEnabled: false })),
	cookies: vi.fn(),
}));

vi.mock('next/navigation', () => ({
	notFound: vi.fn(() => {
		throw new Error('NEXT_NOT_FOUND');
	}),
	permanentRedirect: vi.fn(() => {
		throw new Error('NEXT_REDIRECT');
	}),
	redirect: vi.fn(() => {
		throw new Error('NEXT_REDIRECT');
	}),
}));

vi.mock('@/components/global/Template', () => ({ default: () => null }));

vi.mock('@/hooks/use-base-uri', () => ({ baseUriContext: vi.fn() }));

vi.mock('@/i18n/get-locales', () => ({ getLocales: vi.fn() }));

vi.mock('@/lib', async () => ({
	addLangPrefix: (uri: string) => uri,
	getAllURIs: vi.fn(),
	getAuthToken: vi.fn(),
	getPreviewNodeByURI: vi.fn(),
	getPublicNodeByURI: vi.fn(async () => null),
	getRedirection: vi.fn(async () => ({
		destination: '/new/',
		isPermanent: true,
	})),
	getWpUriFromNextPath: (await import('@/lib/get-wp-uri-from-next-path'))
		.default,
}));

const render = (uri: string[]) =>
	Page({ params: Promise.resolve({ uri, lang: 'fr' as Locale }) });

afterEach(() => {
	vi.clearAllMocks();
});

describe('Page', () => {
	it('redirects a URI with no node that is a redirect source', async () => {
		await expect(render(['old'])).rejects.toThrow('NEXT_REDIRECT');

		expect(vi.mocked(getRedirection)).toHaveBeenCalledWith('/old/');
		expect(vi.mocked(permanentRedirect)).toHaveBeenCalledWith('/new/');
	});

	it('answers 404 to a `/page/{n}` with no node, without a redirect lookup', async () => {
		await expect(render(['old', 'page', '2'])).rejects.toThrow(
			'NEXT_NOT_FOUND'
		);

		expect(vi.mocked(getPublicNodeByURI)).toHaveBeenCalledWith(
			'/old/',
			'fr',
			2
		);
		expect(vi.mocked(getRedirection)).not.toHaveBeenCalled();
		expect(vi.mocked(notFound)).toHaveBeenCalled();
	});
});
