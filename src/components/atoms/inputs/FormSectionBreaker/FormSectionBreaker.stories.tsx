import { Meta, StoryObj } from '@storybook/react';

import { FormSectionBreaker } from './index';

const meta = {
	title: 'Components/Atoms/FormSectionBreaker',
	component: FormSectionBreaker,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof FormSectionBreaker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		title: 'Documents',
	},
};
