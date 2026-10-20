import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Paragraph from '.';

describe('Paragraph', () => {
	it('renders the inner HTML of content wrapped in a <p>, as a stale block registry returns it', () => {
		const html = renderToStaticMarkup(
			<Paragraph content="<p>Hello <strong>world</strong></p>" />
		);

		expect(html).toBe(
			'<p class="wp-block-paragraph">Hello <strong>world</strong></p>'
		);
	});

	it('strips an outer <p> that carries attributes', () => {
		const html = renderToStaticMarkup(
			<Paragraph content={'<p class="has-text-align-center">Hello</p>'} />
		);

		expect(html).toBe('<p class="wp-block-paragraph">Hello</p>');
	});

	it('renders unwrapped content as is', () => {
		const html = renderToStaticMarkup(<Paragraph content="Hello" />);

		expect(html).toBe('<p class="wp-block-paragraph">Hello</p>');
	});

	it('keeps content that is not a single <p> as is', () => {
		const html = renderToStaticMarkup(
			<Paragraph content="<p>One</p> and <p>Two</p>" />
		);

		expect(html).toBe(
			'<p class="wp-block-paragraph"><p>One</p> and <p>Two</p></p>'
		);
	});

	it('renders nothing without content', () => {
		expect(renderToStaticMarkup(<Paragraph content="" />)).toBe('');
	});
});
