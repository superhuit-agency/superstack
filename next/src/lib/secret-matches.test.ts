import { describe, expect, it } from 'vitest';

import secretMatches from '@/lib/secret-matches';

describe('secretMatches', () => {
	it('matches the same secret', () => {
		expect(secretMatches('s3cret', 's3cret')).toBe(true);
	});

	it.each(['', 's3cre', 's3cret!', 'S3CRET'])('refuses "%s"', (given) => {
		expect(secretMatches(given, 's3cret')).toBe(false);
	});
});
