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
		text: 'Button Primary',
		url: '#',
	},
};

export const Secondary: Story = {
	args: {
		text: 'Button Secondary',
		url: '#',
		variant: 'secondary',
	},
};

export const Submit: Story = {
	args: {
		type: 'submit',
		text: 'Submit Form',
	},
};

export const Download: Story = {
	args: {
		download: true,
		text: 'Download file',
		url: '/file.pdf',
	},
};

export const External: Story = {
	args: {
		text: 'Made by Superhuit',
		url: 'https://superhuit.ch',
		target: '_blank',
	},
};

export const Empty: Story = {
	args: {
		text: undefined,
		url: 'https://superhuit.ch',
		target: '_blank',
	},
};
