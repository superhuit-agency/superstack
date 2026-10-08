import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Avatar from '.';

describe('Avatar', () => {
	it('renders the avatar', () => {
		const html = renderToStaticMarkup(
			<Avatar
				size={48}
				data={{
					uri: '/author/jane/',
					url: 'https://secure.gravatar.com/avatar/jane',
					alt: 'Jane Doe',
				}}
			/>
		);

		expect(html).toContain('wp-block-avatar');
		expect(html).toContain('alt="Jane Doe"');
	});

	it('renders nothing without data, as when its data fails in preview', () => {
		expect(renderToStaticMarkup(<Avatar size={48} />)).toBe('');
	});
});
