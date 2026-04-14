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
		content: 'Heading',
		level: 1,
	},
};

export const H2: Story = {
	args: {
		content: 'Heading',
		level: 2,
	},
};

export const H3: Story = {
	args: {
		content: 'Heading',
		level: 3,
	},
};

export const H4: Story = {
	args: {
		content: 'Heading',
		level: 4,
	},
};

export const H5: Story = {
	args: {
		content: 'Heading',
		level: 5,
	},
};

export const H6: Story = {
	args: {
		content: 'Heading',
		level: 6,
	},
};
