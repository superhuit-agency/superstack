import { expect, fireEvent } from '@storybook/test';

import block from './block.json';
import { InputTextarea } from './index';
import * as stories from './InputTextarea.stories';
/**
 * Unique name for the component tests.
 * Returns an object from each storybook story with for each a unit test to run.
 */
export const InputTextareaTests: ComponentTests = {
	block: block,
	component: InputTextarea,
	tests: {
		Default: {
			args: stories.Default.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Display
				expect(component).toBeVisible();
				expect(component).toHaveClass('supt-input-textarea');
				// Label
				const label = component?.querySelector('label');
				expect(label).toBeInTheDocument();
				expect(label).toHaveTextContent('Message');
				// Textarea
				const textarea = component?.querySelector('textarea');
				expect(textarea).toBeInTheDocument();
				expect(textarea).toHaveAttribute('placeholder', 'Lorem ipsum');
				expect(textarea).toHaveAttribute('name', 'message');
				// No error state
				expect(component).not.toHaveClass('-error');
			},
		},
		Filled: {
			args: stories.Filled.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Textarea value
				const textarea = component?.querySelector('textarea');
				expect(textarea).toBeInTheDocument();
				expect(textarea).toHaveValue(
					'Anim dolor ea culpa reprehenderit minim adipisicing.'
				);
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
				// Textarea aria-invalid
				const textarea = component?.querySelector('textarea');
				expect(textarea).toHaveAttribute('aria-invalid', 'true');
			},
		},
	},
};
