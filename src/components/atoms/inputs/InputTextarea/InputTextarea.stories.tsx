import { Meta, StoryObj } from '@storybook/react';

import { InputTextarea } from './index';

const meta = {
	title: 'Components/Atoms/Inputs/Input Textarea',
	component: InputTextarea,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof InputTextarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		label: 'Message',
		name: 'message',
		placeholder: 'Lorem ipsum',
	},
};

export const Filled: Story = {
	args: {
		...Default.args,
		inputAttributes: {
			value: 'Anim dolor ea culpa reprehenderit minim adipisicing.',
		},
	},
};

export const WithError: Story = {
	args: {
		...Default.args,
		invalid: 'Error message',
	},
};
