import { Meta, StoryObj } from '@storybook/react';

import { Link } from './index';

const meta = {
	title: 'Components/Atoms/Link',
	component: Link,
} satisfies Meta<typeof Link>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		href: '#actualités',
		children: 'Actualités',
	},
};
