import postcss from 'postcss';
import postcssMixins from 'postcss-mixins';
import { describe, expect, it } from 'vitest';
import { clamp } from './clamp.js';

const render = async (params: string) => {
	const result = await postcss([
		postcssMixins({ mixins: { clamp } }),
	]).process(`a { @mixin clamp ${params}; }`, { from: undefined });
	return result.css;
};

describe('clamp mixin', () => {
	it.each([
		['width, 24, 32, 600px, 900px', 'clamp(24px, 2.67vw + 0.5rem, 32px)'],
		['width, 16, 16, 600px, 900px', 'clamp(16px, 0vw + 1rem, 16px)'],
		[
			'width, 12, 48, 375px, 1440px',
			'clamp(12px, 3.38vw + -0.04rem, 48px)',
		],
	])('keeps the output unchanged for %s', async (params, value) => {
		expect(await render(params)).toBe(`a { width: ${value}; }`);
	});

	it('puts the smaller size first when the slope is inverted', async () => {
		expect(await render('width, 65, 50, 600px, 900px')).toBe(
			'a { width: clamp(50px, -5vw + 5.94rem, 65px); }'
		);
	});

	it('compares sizes numerically, not as strings', async () => {
		expect(await render('width, 12, 9, 600px, 900px')).toBe(
			'a { width: clamp(9px, -1vw + 1.13rem, 12px); }'
		);
	});
});
