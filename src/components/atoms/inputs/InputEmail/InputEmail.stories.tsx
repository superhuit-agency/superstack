import { Meta, StoryObj } from '@storybook/react';

import { InputEmail } from './index';

const meta = {
	title: 'Components/Atoms/Inputs/Input Email',
	component: InputEmail,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof InputEmail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		label: 'Email',
		name: 'email',
		placeholder: 'john@doe.com',
	},
};

export const Filled: Story = {
	args: {
		...Default.args,
		inputAttributes: {
			value: 'jane.doe@email.com',
		},
	},
};

export const WithError: Story = {
	args: {
		...Default.args,
		invalid: 'Error message',
	},
};
