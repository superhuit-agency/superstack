import { expect, fireEvent } from '@storybook/test';

import block from './block.json';
import { InputEmail } from './index';
import * as stories from './InputEmail.stories';
/**
 * Unique name for the component tests.
 * Returns an object from each storybook story with for each a unit test to run.
 */
export const InputEmailTests: ComponentTests = {
	block: block,
	component: InputEmail,
	tests: {
		Default: {
			args: stories.Default.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Display
				expect(component).toBeVisible();
				expect(component).toHaveClass('supt-input-email');
				// Label
				const label = component?.querySelector('label');
				expect(label).toBeInTheDocument();
				expect(label).toHaveTextContent('Email');
				// Input
				const input = component?.querySelector('input');
				expect(input).toBeInTheDocument();
				expect(input).toHaveAttribute('placeholder', 'john@doe.com');
				expect(input).toHaveAttribute('name', 'email');
				expect(input).toHaveAttribute('type', 'email');
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
				expect(input).toHaveValue('jane.doe@email.com');
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
				expect(errorElement).toHaveTextContent(
					'Please enter a valid email address'
				);
				// Input aria-invalid
				const input = component?.querySelector('input');
				expect(input).toHaveAttribute('aria-invalid', 'true');
			},
		},
	},
};
