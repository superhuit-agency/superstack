import { Meta, StoryObj } from '@storybook/react';

import { InputText } from './index';

const meta = {
	title: 'Components/Atoms/Inputs/Input Text',
	component: InputText,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof InputText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		label: 'Name',
		name: 'name',
		placeholder: 'John Doe',
	},
};

export const Filled: Story = {
	args: {
		...Default.args,
		inputAttributes: {
			value: 'Jane Doe',
		},
	},
};

export const WithError: Story = {
	args: {
		...Default.args,
		invalid: 'Error message',
	},
};
