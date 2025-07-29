import { Meta, StoryObj } from '@storybook/react';

import { Heading } from './index';

const meta = {
	title: 'Components/Atoms/Heading',
	component: Heading,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof Heading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const H1: Story = {
	args: {
		content: 'Main Title',
		level: 1,
	},
};

export const H2: Story = {
	args: {
		content: 'Subtitle 2',
		level: 2,
	},
};

export const H3: Story = {
	args: {
		content: 'Subtitle 3',
		level: 3,
	},
};

export const H4: Story = {
	args: {
		content: 'Subtitle 4',
		level: 4,
	},
};

export const H5: Story = {
	args: {
		content: 'Subtitle 5',
		level: 5,
	},
};

export const H6: Story = {
	args: {
		content: 'Subtitle 6',
		level: 6,
	},
};

export const Invalid: Story = {
	args: {
		content: '',
		level: 0,
	},
};
