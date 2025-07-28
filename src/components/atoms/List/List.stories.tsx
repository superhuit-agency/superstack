import { Meta, StoryObj } from '@storybook/react';

import { List } from './index';
import { ListItem } from '..';

const meta = {
	title: 'Components/Atoms/List',
	component: List,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof List>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		ordered: false,
		children: (
			<>
				<ListItem content="Ullamco dolore laborum cupidatat sint mollit culpa eu esse ipsum deserunt." />
				<ListItem content="Est amet tempor consectetur et laboris eiusmod ullamco velit.">
					<List ordered={false}>
						<ListItem content="Consequat ad non culpa qui qui ea." />
						<ListItem content="Elit exercitation anim fugiat aute nulla." />
					</List>
				</ListItem>
				<ListItem content="Commodo incididunt aliqua cupidatat id quis aliqua.">
					<List ordered={true}>
						<ListItem content="Esse officia amet enim consequat Lorem." />
						<ListItem content="Voluptate reprehenderit non proident." />
					</List>
				</ListItem>
			</>
		),
	},
};

export const Ordered: Story = {
	args: {
		ordered: true,
		children: (
			<>
				<ListItem content="First item" />
				<ListItem content="Second item" />
				<ListItem content="Third item" />
			</>
		),
	},
};

export const OrderedWithCounter: Story = {
	args: {
		ordered: true,
		start: 1,
		children: (
			<>
				<ListItem content="Second item" />
				<ListItem content="Third item" />
				<ListItem content="Fourth item" />
			</>
		),
	},
};

export const WithEmptyItems: Story = {
	args: {
		ordered: false,
		children: (
			<>
				<ListItem content="First item" />
				<ListItem content="" id="empty-item" />
				<ListItem content="Third item" />
			</>
		),
	},
};
