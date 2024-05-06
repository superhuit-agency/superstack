import { Meta, StoryObj } from '@storybook/react';

import { Media } from './index';

const meta = {
	title: 'Components/Molecules/Media',
	component: Media,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof Media>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		mediaType: 'image',
		image: {
			src: 'https://placeholder.pics/svg/500x500/CCC-CC/222-CCC/photo',
			alt: '',
			width: 500,
			height: 500,
		},
	},
};
