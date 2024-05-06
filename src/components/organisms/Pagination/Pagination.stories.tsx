import { Meta, StoryObj } from '@storybook/react';

import { Pagination } from './index';

const meta = {
	title: 'Components/Organisms/Pagination',
	component: Pagination,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		baseUri: 'https://example.com/0',
		currentPagination: 50,
		totalPages: 100,
	},
};
