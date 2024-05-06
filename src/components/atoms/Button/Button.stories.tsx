import { Meta, StoryObj } from '@storybook/react';

import { Button } from '.';

const meta = {
	title: 'Components/Atoms/Button',
	component: Button,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
	args: {
		title: 'Button Primary',
		href: '#',
	},
};

export const Secondary: Story = {
	args: {
		title: 'Button Secondary',
		href: '#',
		variant: 'secondary',
	},
};
