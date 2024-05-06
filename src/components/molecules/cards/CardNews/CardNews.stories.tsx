import { Meta, StoryObj } from '@storybook/react';

import { CardNews } from './index';

const meta = {
	title: 'Components/Molecules/Cards/Card News',
	component: CardNews,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof CardNews>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		date: '2020-11-06T15:08:27',
		title: 'Duis aliquip velit laborum sint minim pariatur culpa cupidatat consequat elit eiusmod',
		excerpt:
			'Reprehenderit sit anim eu in occaecat. Cillum in dolor commodo aute. Aliquip culpa ea deserunt in laborum minim reprehenderit qui. Deserunt id laboris occaecat fugiat veniam voluptate et occaecat culpa laborum dolor. Sint esse commodo eu laboris est exercitation irure fugiat est. Occaecat non sunt cupidatat eu occaecat commodo commodo ipsum nulla exercitation sint et.',
		uri: '/article-url',
	},
};

export const WithImage: Story = {
	args: {
		...Default.args,
		image: {
			src: 'https://placehold.co/500x300',
			width: 500,
			height: 300,
			alt: '',
		},
	},
};

export const WithCategory: Story = {
	args: {
		...Default.args,
		category: {
			title: 'Technology',
			href: '#technology',
		},
	},
};
