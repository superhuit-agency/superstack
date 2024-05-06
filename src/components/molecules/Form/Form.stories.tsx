import { Meta, StoryObj } from '@storybook/react';

import { Form } from './index';

const meta = {
	title: 'Components/Molecules/Form',
	component: Form,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof Form>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		id: 125,
		opt_ins: [],
		fields: [
			{
				block: 'supt/input-text',
				attributes: {
					label: 'Name',
					name: 'John Doe',
				},
			},
			{
				block: 'supt/input-email',
				attributes: {
					label: 'Email',
					name: 'john@doe.com',
				},
			},
			{
				block: 'supt/input-textarea',
				attributes: {
					label: 'Message',
					name: 'Lorem ipsum',
				},
			},
			{
				block: 'supt/form-section-breaker',
				attributes: {
					title: 'Form section',
				},
			},
			{
				block: 'supt/input-select',
				attributes: {
					label: 'Color',
					placeholder: 'Select color',
					name: 'color',
					options: 'red: Red; blue: Blue; orange: Orange;',
				},
			},
			{
				block: 'supt/input-file',
				attributes: {
					title: 'CV',
					name: 'cv',
					description:
						'1 seul fichier. Limité à 5 Mo. <br> Types autorisés: pdf, doc, docx, zip.',
					label: 'Ajouter un fichier',
				},
			},
			{
				block: 'supt/input-checkbox',
				attributes: {
					label: 'Plusieurs choix possibles',
					name: 'multiple',
				},
				children: [
					{
						attrs: {
							label: 'Choice 1',
							name: 'Name choice 1',
						},
					},
					{
						attrs: {
							label: 'Choice 2',
							name: 'Name choice 2',
						},
					},
				],
			},
			{
				block: 'supt/input-radio',
				attributes: {
					label: 'Un seul choix possible',
					name: 'one',
				},
				children: [
					{
						attrs: {
							label: 'Choice 1',
							name: 'Name choice 1',
						},
					},
					{
						attrs: {
							label: 'Choice 2',
							name: 'Name choice 2',
						},
					},
				],
			},
		],
	},
};
