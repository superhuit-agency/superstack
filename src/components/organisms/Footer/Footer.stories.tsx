import { Meta, StoryObj } from '@storybook/react';

import { Footer } from './index';

const meta = {
	title: 'Components/Organisms/Footer',
	component: Footer,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof Footer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		isHome: true,
		siteTitle: 'Website Name',
		menus: {
			social: {
				items: [],
			},
			footer: {
				items: [
					{
						label: 'Home',
						path: '/',
					},
					{
						label: 'About',
						path: '/about',
					},
					{
						label: 'Contact',
						path: '/contact',
					},
				],
			},
			legal: {
				items: [
					{
						label: 'Privacy Policy',
						path: '/privacy-policy',
					},
					{
						label: 'Terms of Service',
						path: '/terms-of-service',
					},
				],
			},
		},
	},
};
