import { Meta, StoryObj } from '@storybook/react';

import { Video } from './index';

const meta = {
	title: 'Components/Molecules/Video',
	component: Video,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof Video>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		id: '259411563',
		source: 'vimeo',
		poster: {
			src: 'https://placeholder.pics/svg/750x200/CCC-CCC/222-CCC/photo',
			width: 750,
			height: 200,
			alt: '',
		},
		caption: '© Mollit ea laboris ad nulla tempor.',
	},
};
