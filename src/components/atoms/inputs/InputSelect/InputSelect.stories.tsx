import { Meta, StoryObj } from '@storybook/react';

import { InputSelect } from './index';

const meta = {
	title: 'Components/Atoms/Inputs/Input Select',
	component: InputSelect,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof InputSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		label: 'Color',
		name: 'color',
		placeholder: 'Select color',
		options: 'red: Red; blue: Blue; orange: Orange;',
	},
};

export const Filled: Story = {
	args: {
		...Default.args,
		value: 'orange',
	},
};

export const WithError: Story = {
	args: {
		...Default.args,
		invalid: 'Error message',
	},
};
