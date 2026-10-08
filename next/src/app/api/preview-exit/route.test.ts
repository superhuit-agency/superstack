import { cookies, draftMode } from 'next/headers';
import {
	getRedirectStatusCodeFromError,
	getURLFromRedirectError,
} from 'next/dist/client/components/redirect';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '@/app/api/preview-exit/route';

/** Like Next's `DraftMode`: `disable()` reads `this`. */
class DraftMode {
	isEnabled = true;

	disable() {
		this.isEnabled = false;
	}
}

let draft: DraftMode;
const cookieStore = { delete: vi.fn() };

vi.mock('next/headers', () => ({
	draftMode: vi.fn(async () => draft),
	cookies: vi.fn(async () => cookieStore),
}));

/** Where the route redirects to, and with which status. */
async function exit(query: string) {
	try {
		await GET(
			new NextRequest(`http://localhost:3000/api/preview-exit/${query}`)
		);
	} catch (error) {
		if (!isRedirectError(error)) throw error;

		return {
			url: getURLFromRedirectError(error),
			status: getRedirectStatusCodeFromError(error),
		};
	}

	throw new Error('No redirect');
}

beforeEach(() => {
	draft = new DraftMode();
});

afterEach(() => {
	vi.clearAllMocks();
});

describe('GET /api/preview-exit', () => {
	it('leaves Draft Mode and redirects to the page', async () => {
		const { url, status } = await exit('?redirect=%2Fcompany%2F');

		expect(vi.mocked(draftMode)).toHaveBeenCalled();
		expect(draft.isEnabled).toBe(false);
		expect(vi.mocked(cookies)).toHaveBeenCalled();
		expect(cookieStore.delete).toHaveBeenCalledWith('token');
		expect(cookieStore.delete).toHaveBeenCalledWith('preview-draft');
		expect(url).toBe('/company/');
		expect(status).toBe(307);
	});

	it('keeps the query of the page', async () => {
		const { url } = await exit('?redirect=%2Fblog%2F%3Fs%3Dnews');

		expect(url).toBe('/blog/?s=news');
	});

	it('redirects to the home page without a page', async () => {
		const { url } = await exit('');

		expect(url).toBe('/');
		expect(draft.isEnabled).toBe(false);
	});

	it.each([
		'//evil.example',
		'/\\evil.example',
		'/.//evil.example',
		'https://evil.example/x',
	])('redirects to the home page instead of "%s"', async (target) => {
		const { url } = await exit(`?redirect=${encodeURIComponent(target)}`);

		expect(url).toBe('/');
	});
});
