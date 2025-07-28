import { expect, fireEvent } from '@storybook/test';

import block from './block.json';
import { InputText } from './index';
import * as stories from './InputText.stories';
/**
 * Unique name for the component tests.
 * Returns an object from each storybook story with for each a unit test to run.
 */
export const InputTextTests: ComponentTests = {
	block: block,
	component: InputText,
	tests: {
		Default: {
			args: stories.Default.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Display
				expect(component).toBeVisible();
				expect(component).toHaveClass('supt-input-text');
				// Label
				const label = component?.querySelector('label');
				expect(label).toBeInTheDocument();
				expect(label).toHaveTextContent('Name');
				// Input
				const input = component?.querySelector('input');
				expect(input).toBeInTheDocument();
				expect(input).toHaveAttribute('placeholder', 'John Doe');
				expect(input).toHaveAttribute('name', 'name');
				expect(input).toHaveAttribute('type', 'text');
				// No error state
				expect(component).not.toHaveClass('-error');
			},
		},
		Filled: {
			args: stories.Filled.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Input value
				const input = component?.querySelector('input');
				expect(input).toBeInTheDocument();
				expect(input).toHaveValue('Jane Doe');
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
				// Input aria-invalid
				const input = component?.querySelector('input');
				expect(input).toHaveAttribute('aria-invalid', 'true');
			},
		},
	},
};
