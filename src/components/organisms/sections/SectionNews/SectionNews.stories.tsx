import { Meta, StoryObj } from '@storybook/react';

import { SectionNews } from './index';

const meta = {
	title: 'Components/Organisms/Sections/Section News',
	component: SectionNews,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof SectionNews>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		uptitle: 'Latest news',
		seeAllLink: {
			title: 'See all news',
			href: '/news',
		},
		posts: [
			{
				date: '2023-10-02T15:08:27',
				title: 'Ullamco nulla deserunt aliqua labore pariatur proident',
				excerpt:
					'Eiusmod consequat veniam sit velit cupidatat. Lorem magna Lorem dolore nisi sit do commodo. Sunt aliqua do proident anim cillum. Elit reprehenderit qui dolore adipisicing enim id est.',
				uri: '/article-url',
			},
			{
				date: '2023-09-15T15:08:27',
				title: 'Et consequat ad laboris dolore ut',
				excerpt:
					'Consequat cillum velit excepteur tempor. Dolore deserunt ad consectetur proident cupidatat quis dolor do sint pariatur culpa.',
				uri: '/article-url',
			},
			{
				date: '2023-06-16T15:08:27',
				title: 'Sit elit nisi consequat dolor commodo laborum',
				excerpt:
					'Laboris cupidatat commodo dolor aliquip deserunt nostrud nostrud in consequat proident exercitation deserunt. Esse eiusmod ipsum occaecat nostrud. Nisi ipsum quis officia cupidatat ut.',
				uri: '/article-url',
			},
		],
	},
};
