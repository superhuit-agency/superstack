import React from 'react';
import type { Preview } from '@storybook/react';
import { Inter, Roboto_Mono } from 'next/font/google';

import '@/css/base/index.css';

// Fonts
const inter = Inter({
	subsets: ['latin'],
	variable: '--font-primary',
	display: 'swap',
});
const roboto_mono = Roboto_Mono({
	subsets: ['latin'],
	variable: '--font-secondary',
	display: 'swap',
});

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		options: {
			storySort: {
				order: ['Editor', 'Components'],
			},
		},
	},
	decorators: [
		(Story) => {
			return (
				<div className={`${inter.variable} ${roboto_mono.variable}`}>
					<Story />
				</div>
			);
		},
	],
};

export default preview;
