import { Meta, StoryObj } from '@storybook/react';

import Button from '.';

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
		variant: 'outline',
	},
};

export const Submit: Story = {
	args: {
		text: 'Submit Form',
	},
};

export const Download: Story = {
	args: {
		text: 'Download file',
		url: '/file.pdf',
	},
};

export const External: Story = {
	args: {
		text: 'Made by Superhuit',
		url: 'https://superhuit.ch',
		linkTarget: '_blank',
	},
};

export const Empty: Story = {
	args: {
		text: undefined,
		url: 'https://superhuit.ch',
		linkTarget: '_blank',
	},
	tags: ['!dev'], // Does not show in storybook's sidebar
};
