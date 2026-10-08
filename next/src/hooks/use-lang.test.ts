import { describe, expect, it, vi } from 'vitest';

import { langContext } from '@/hooks/use-lang';

// Outside a server render, React's `cache()` doesn't memoize: give the test
// one request scope.
vi.mock('react', () => ({
	cache: (fn: () => unknown) => {
		let value: unknown;
		return () => (value ??= fn());
	},
}));

describe('langContext', () => {
	it('reads the language set earlier in the request', () => {
		expect(langContext()).toBeNull();

		expect(langContext('de')).toBe('de');
		expect(langContext()).toBe('de');
	});
});
