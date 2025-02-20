import { Meta, StoryObj } from '@storybook/react';

import { Gdpr } from '.';

const meta = {
	title: 'Components/Molecules/Gdpr',
	component: Gdpr,
	argTypes: {},
	parameters: {
		layout: 'fullscreen',
	},
} satisfies Meta<typeof Gdpr>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
};
