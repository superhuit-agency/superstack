import { Meta, StoryObj } from '@storybook/react';

import { MainNav } from './index';

const meta = {
	title: 'Components/Organisms/MainNav',
	component: MainNav,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof MainNav>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		menus: {
			header: {
				items: [],
			},
		},
		siteTitle: 'Site Title',
	},
};
