import { describe, expect, it } from 'vitest';
import { phpToJsDateFormat } from '@/utils/php-to-js-date-format';

describe('phpToJsDateFormat', () => {
	it('converts a numeric PHP date format', () => {
		expect(phpToJsDateFormat('d.m.Y')).toEqual({
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
	});

	it('converts a textual PHP date format', () => {
		expect(phpToJsDateFormat('l j F y')).toEqual({
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: '2-digit',
		});
	});
});
