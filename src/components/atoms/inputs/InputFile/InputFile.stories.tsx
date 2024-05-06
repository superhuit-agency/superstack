import { Meta, StoryObj } from '@storybook/react';

import { InputFile } from './index';

const meta = {
	title: 'Components/Atoms/Inputs/Input File',
	component: InputFile,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof InputFile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		title: 'CV',
		name: 'cv',
		description:
			'1 seul fichier. Limité à 5 Mo. <br> Types autorisés: pdf, doc, docx, zip.',
		label: 'Ajouter un fichier',
	},
};

export const WithError: Story = {
	args: {
		...Default.args,
		invalid: 'Error message',
	},
};
