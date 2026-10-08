import { describe, expect, it } from 'vitest';

import { cacheTags, decodePath } from '@/lib/cache-tags';

describe('cacheTags.redirect', () => {
	it('names the normalised URI', () => {
		expect(cacheTags.redirect('/Old-Page?x=1')).toBe('redirect:/old-page/');
	});

	it('keeps the tag of a long URI within the 256 characters Next takes', () => {
		const uri = `/${'a'.repeat(300)}/`;

		const tag = cacheTags.redirect(uri);

		expect(tag).toHaveLength(256);
		expect(tag.startsWith('redirect:/aaa')).toBe(true);
		expect(cacheTags.redirect(uri.toUpperCase())).toBe(tag);
	});

	it('tells apart long URIs that differ past the cut', () => {
		const base = `/${'a'.repeat(300)}`;

		expect(cacheTags.redirect(`${base}-1/`)).not.toBe(
			cacheTags.redirect(`${base}-2/`)
		);
	});
});

describe('decodePath', () => {
	it('decodes a percent-encoded path, keeping its case', () => {
		expect(decodePath('/caf%c3%a9/')).toBe('/café/');
		expect(decodePath('/%D0%BF%D1%80%D0%B8/Page/')).toBe('/при/Page/');
	});

	it('keeps a malformed path as it came', () => {
		expect(decodePath('/100%/')).toBe('/100%/');
	});
});

describe('cacheTags.redirect of a non-ASCII URI', () => {
	it('is the same encoded or not', () => {
		expect(cacheTags.redirect('/caf%c3%a9/')).toBe('redirect:/café/');
		expect(cacheTags.redirect('/Café/')).toBe('redirect:/café/');
	});
});
