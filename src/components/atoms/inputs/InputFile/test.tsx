import { expect, fireEvent } from '@storybook/test';

import block from './block.json';
import { InputFile } from './index';
import * as stories from './InputFile.stories';
/**
 * Unique name for the component tests.
 * Returns an object from each storybook story with for each a unit test to run.
 */
export const InputFileTests: ComponentTests = {
	block: block,
	component: InputFile,
	tests: {
		Default: {
			args: stories.Default.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Display
				expect(component).toBeVisible();
				expect(component).toHaveClass('supt-input-file');
				expect(component).toHaveTextContent('Ajouter un fichier');
				// File input
				const fileInput =
					component?.querySelector('input[type="file"]');
				expect(fileInput).toBeInTheDocument();
				expect(fileInput).toHaveAttribute('name', 'cv');
				// No error state
				expect(component).not.toHaveClass('-error');
			},
		},
		WithError: {
			args: stories.WithError.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Error state
				expect(component).toHaveClass('-error');
				// Error message
				const errorElement = component?.querySelector('[role="alert"]');
				expect(errorElement).toBeInTheDocument();
				expect(errorElement).toHaveTextContent('Error message');
			},
		},
	},
};
