import { Meta, StoryObj } from '@storybook/react';

import { Button } from '@/components/atoms/Button';
import { Buttons } from '.';

const meta = {
	title: 'Components/Molecules/Buttons',
	component: Buttons,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof Buttons>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: (
			<>
				<Button text="Button 1" url="#" />
				<Button text="Button 2" url="#" variant="secondary" />
			</>
		),
	},
};
