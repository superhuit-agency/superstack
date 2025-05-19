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

export const Submit: Story = {
	args: {
		type: 'submit',
		title: 'Submit Form',
	},
};

export const Download: Story = {
	args: {
		download: true,
		title: 'Download file',
		href: '/file.pdf',
	},
};

export const External: Story = {
	args: {
		title: 'Made by Superhuit',
		href: 'https://superhuit.ch',
		target: '_blank',
	},
};

export const Empty: Story = {
	args: {
		title: undefined,
		href: 'https://superhuit.ch',
		target: '_blank',
	},
};
