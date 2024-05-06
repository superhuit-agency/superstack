import { Meta, StoryObj } from '@storybook/react';

import { InputRadio } from './index';

const meta = {
	title: 'Components/Atoms/Inputs/Input Radio',
	component: InputRadio,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof InputRadio>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		label: 'Label',
		name: 'name',
		options: [
			{
				attrs: {
					name: 'name',
					label: 'Choice 1',
					value: 'choice-1',
					defaultChecked: true,
				},
			},
			{
				attrs: {
					name: 'name',
					label: 'Choice 2',
					value: 'choice-2',
				},
			},
		],
	},
};

export const WithError: Story = {
	args: {
		...Default.args,
		invalid: 'Error message',
	},
};
