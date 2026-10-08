import { describe, expect, it } from 'vitest';

import getWpUriFromNextPath from '@/lib/get-wp-uri-from-next-path';

describe('getWpUriFromNextPath', () => {
	it('builds the URI of the home and of a nested path', () => {
		expect(getWpUriFromNextPath([])).toBe('/');
		expect(getWpUriFromNextPath(['company', 'team'])).toBe(
			'/company/team/'
		);
	});

	it('decodes percent-encoded segments, as WordPress resolves the decoded URI', () => {
		expect(
			getWpUriFromNextPath([
				'blog',
				'%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82-%D0%BC%D0%B8%D1%80',
			])
		).toBe('/blog/привет-мир/');
	});

	it('gives the same URI for encoded and already decoded segments', () => {
		expect(getWpUriFromNextPath(['caf%C3%A9'])).toBe(
			getWpUriFromNextPath(['café'])
		);
	});

	it('keeps a segment with a malformed escape sequence as it came', () => {
		expect(getWpUriFromNextPath(['100%', '%D0%BF'])).toBe('/100%/п/');
	});
});
