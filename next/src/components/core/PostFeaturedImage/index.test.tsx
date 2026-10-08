// @vitest-environment happy-dom
import { act } from 'react';
import { describe, expect, it } from 'vitest';

import { setUpRoot } from '@/test-utils/render-pages';

import PostFeaturedImage from '.';

describe('PostFeaturedImage', () => {
	const test = setUpRoot();

	function render(featuredImage: PostFeaturedImageProps['featuredImage']) {
		act(() =>
			test.root.render(
				<PostFeaturedImage featuredImage={featuredImage} />
			)
		);
		return test.container.querySelector('img')!;
	}

	it('renders an image at its own dimensions', () => {
		const image = render({
			sourceUrl: 'https://example.com/photo.jpg',
			altText: 'A photo',
			mediaDetails: { width: 1200, height: 800 },
		});

		expect(image.getAttribute('width')).toBe('1200');
		expect(image.getAttribute('height')).toBe('800');
	});

	it('renders an SVG, which has no dimensions, at the block width', () => {
		const image = render({
			sourceUrl: 'https://example.com/logo.svg',
			altText: 'A logo',
			mediaDetails: { width: null, height: null },
		});

		expect(image.getAttribute('src')).toBe('https://example.com/logo.svg');
		expect(image.style.width).toBe('100%');
		expect(image.style.height).toBe('auto');
	});
});
