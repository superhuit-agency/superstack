import InputFileBlock from './block.json';
import { InputFile } from './index';
import { expect } from '@storybook/test';

export default {
	title: 'Components/Atoms/Inputs/Input File',
	component: InputFile,
	parameters: {
		layout: 'centered',
	},
	args: {},
	blockConfig: InputFileBlock,
	getTestableStories: () => [Default, WithError],
} as TestableComponentMeta<typeof InputFile>;

export const Default: TestableStory<typeof InputFile> = {
	name: 'InputFile Default',
	args: {
		title: 'CV',
		name: 'cv',
		description:
			'1 seul fichier. Limité à 5 Mo. <br> Types autorisés: pdf, doc, docx, zip.',
		label: 'Ajouter un fichier',
	},
	unitTest: (component: Element | null) => {
		// General
		expect(component).toBeInTheDocument();
		// Display
		expect(component).toBeVisible();
		expect(component).toHaveClass('supt-input-file');
		expect(component).toHaveTextContent('Ajouter un fichier');
		// File input
		const fileInput = component?.querySelector('input[type="file"]');
		expect(fileInput).toBeInTheDocument();
		expect(fileInput).toHaveAttribute('name', 'cv');
		// No error state
		expect(component).not.toHaveClass('-error');
	},
};

export const WithError: TestableStory<typeof InputFile> = {
	name: 'InputFile WithError',
	args: {
		title: 'CV',
		name: 'cv',
		description:
			'1 seul fichier. Limité à 5 Mo. <br> Types autorisés: pdf, doc, docx, zip.',
		label: 'Ajouter un fichier',
		invalid: 'Error message',
	},
	unitTest: (component: Element | null) => {
		// General
		expect(component).toBeInTheDocument();
		// Error state
		expect(component).toHaveClass('-error');
		// Error message
		const errorElement = component?.querySelector('[role="alert"]');
		expect(errorElement).toBeInTheDocument();
		expect(errorElement).toHaveTextContent('Error message');
	},
};
