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
		label: 'Color',
		name: 'color',
		placeholder: 'Select color',
		options: 'red: Red; blue: Blue; orange: Orange;',
		value: 'orange',
	},
};

export const Disabled: Story = {
	args: {
		label: 'This is a disabled select',
		name: 'disabled',
		placeholder: 'Select a country',
		options: 'France: France; Switzerland: Switzerland; Germany: Germany;',
		disabled: true,
	},
};

export const WithError: Story = {
	args: {
		label: 'Color',
		name: 'color',
		placeholder: 'Select color',
		options: 'red: Red; blue: Blue; orange: Orange;',
		invalid: 'Error message',
	},
};
