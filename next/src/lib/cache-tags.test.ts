import { describe, expect, it } from 'vitest';

import { cacheTags } from '@/lib/cache-tags';

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
