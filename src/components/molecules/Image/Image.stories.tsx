import { Meta, StoryObj } from '@storybook/react';

import { Image } from './index';

const meta = {
	title: 'Components/Molecules/Image',
	component: Image,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof Image>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		alt: "I'm an image",
		src: 'https://placeholder.pics/svg/480x640/CCC-CC/222-CCC/photo',
		width: 480,
		height: 640,
		caption: "I'm a caption",
	},
};
