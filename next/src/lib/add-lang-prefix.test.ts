import { beforeEach, describe, expect, it, vi } from 'vitest';

import addLangPrefix from '@/lib/add-lang-prefix';

const configs = vi.hoisted(() => ({ isMultilang: false }));

vi.mock('@/configs.json', () => ({ default: configs }));

beforeEach(() => {
	configs.isMultilang = false;
});

describe('addLangPrefix', () => {
	it('leaves the URI of a single-language site as it is', () => {
		expect(addLangPrefix('/', 'fr')).toBe('/');
		expect(addLangPrefix('/hello/', 'fr')).toBe('/hello/');
	});

	it('prefixes the URI with its language on a multilingual site', () => {
		configs.isMultilang = true;

		expect(addLangPrefix('/', 'de')).toBe('/de/');
		expect(addLangPrefix('/hello/', 'de')).toBe('/de/hello/');
		expect(addLangPrefix('hello/', 'de')).toBe('/de/hello/');
	});

	it('does not prefix a URI twice', () => {
		configs.isMultilang = true;

		expect(addLangPrefix('/de/hello/', 'de')).toBe('/de/hello/');
	});

	it('leaves the URI as it is without a language', () => {
		configs.isMultilang = true;

		expect(addLangPrefix('/hello/', null)).toBe('/hello/');
	});
});
