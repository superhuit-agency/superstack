import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import PostAuthor from '.';

const props = {
	avatarSize: 48,
	byline: '',
	isLink: false,
	linkTarget: '_self',
	showAvatar: true,
	showBio: false,
};

const author = {
	uri: '/author/jane/',
	name: 'Jane Doe',
	description: '',
	avatar: { url: 'https://example.com/avatar.png' },
};

describe('PostAuthor', () => {
	it('renders the avatar', () => {
		const html = renderToStaticMarkup(
			<PostAuthor {...props} author={author} />
		);

		expect(html).toContain('wp-block-post-author__avatar');
	});

	it('renders the author without an avatar when avatars are turned off', () => {
		const html = renderToStaticMarkup(
			<PostAuthor {...props} author={{ ...author, avatar: null }} />
		);

		expect(html).not.toContain('wp-block-post-author__avatar');
		expect(html).toContain('Jane Doe');
	});
});
