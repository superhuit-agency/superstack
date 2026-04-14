import { Meta, StoryObj } from '@storybook/react';

import { Paragraph } from './index';

const meta = {
	title: 'Components/Atoms/Paragraph',
	component: Paragraph,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof Paragraph>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		content:
			"Excepteur quis aute cupidatat consequat fugiat. Ipsum consectetur laborum reprehenderit Lorem. Sint excepteur aute tempor magna ex culpa dolor do.",
	},
};
