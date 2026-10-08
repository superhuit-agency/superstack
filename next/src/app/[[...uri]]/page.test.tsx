import { cookies, draftMode } from 'next/headers';
import { notFound, permanentRedirect } from 'next/navigation';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getLocales } from '@/i18n/get-locales';
import {
	getAuthToken,
	getPreviewNodeByURI,
	getPublicNodeByURI,
	getRedirection,
} from '@/lib';
import Page, { generateMetadata } from './page';

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

describe('generateMetadata', () => {
	const metadata = (uri: string[]) =>
		generateMetadata({
			params: Promise.resolve({ uri, lang: 'fr' as Locale }),
		});

	const enableDraftMode = () => {
		vi.mocked(draftMode).mockResolvedValueOnce({
			isEnabled: true,
		} as never);
		vi.mocked(cookies).mockResolvedValueOnce({
			get: (name: string) =>
				({
					token: { value: 'refresh' },
					'preview-draft': { value: 'true' },
				})[name],
		} as never);
	};

	beforeEach(() => {
		vi.mocked(getLocales).mockResolvedValue({
			locales: ['fr'],
			defaultLocale: 'fr',
		} as never);
	});

	it('reads the public node outside Draft Mode', async () => {
		vi.mocked(getPublicNodeByURI).mockResolvedValueOnce({
			title: 'Public',
		} as never);

		const { title } = await metadata(['hello']);

		expect(title).toBe('Public');
		expect(vi.mocked(getPreviewNodeByURI)).not.toHaveBeenCalled();
	});

	it('reads the preview node, with auth, in Draft Mode', async () => {
		enableDraftMode();
		vi.mocked(getAuthToken).mockResolvedValueOnce('auth');
		vi.mocked(getPreviewNodeByURI).mockResolvedValueOnce({
			title: 'Draft',
		} as never);

		// A never-published draft is previewed at its ID
		const { title } = await metadata(['37']);

		expect(title).toBe('Draft');
		expect(vi.mocked(getPreviewNodeByURI)).toHaveBeenCalledWith(
			'/37/',
			'fr',
			1,
			{ authToken: 'auth' },
			true
		);
		expect(vi.mocked(getPublicNodeByURI)).not.toHaveBeenCalled();
	});
});
