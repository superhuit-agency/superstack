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
		siteTitle: 'Website Name',
		menus: {
			social: {
				items: [],
			},
			footer: {
				items: [
					{
						id: 'home',
						label: 'Home',
						path: '/',
					},
					{
						id: 'about',
						label: 'About',
						path: '/about',
					},
					{
						id: 'contact',
						label: 'Contact',
						path: '/contact',
					},
				],
			},
			legal: {
				items: [
					{
						id: 'privacy policy',
						label: 'Privacy Policy',
						path: '/privacy-policy',
					},
					{
						id: 'terms of service',
						label: 'Terms of Service',
						path: '/terms-of-service',
					},
				],
			},
		},
	},
};
