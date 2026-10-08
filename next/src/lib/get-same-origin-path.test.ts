import { describe, expect, it } from 'vitest';

import getSameOriginPath from '@/lib/get-same-origin-path';

const ORIGIN = 'http://localhost:3000';

describe('getSameOriginPath', () => {
	it.each([
		['/company/', '/company/'],
		['/blog/?page=2', '/blog/?page=2'],
		['/company/#team', '/company/'],
		['company/', '/company/'],
		[`${ORIGIN}/company/`, '/company/'],
	])('keeps "%s" on the site as "%s"', (target, path) => {
		expect(getSameOriginPath(target, ORIGIN)).toBe(path);
	});

	it.each([
		'//evil.example',
		'/\\evil.example',
		'\\\\evil.example',
		'/.//evil.example',
		'/a/..//evil.example',
		'/./\\evil.example',
		'https://evil.example/x',
		'javascript:alert(1)',
		'',
		null,
		undefined,
	])('falls back to "/" for %s', (target) => {
		expect(getSameOriginPath(target, ORIGIN)).toBe('/');
	});
});
