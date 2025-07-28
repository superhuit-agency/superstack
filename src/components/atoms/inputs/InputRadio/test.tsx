import { act } from '@testing-library/react';
import { expect, fireEvent } from '@storybook/test';

import block from './block.json';
import { InputRadio } from './index';
import * as stories from './InputRadio.stories';
/**
 * Unique name for the component tests.
 * Returns an object from each storybook story with for each a unit test to run.
 */
export const InputRadioTests: ComponentTests = {
	block: block,
	component: InputRadio,
	tests: {
		Default: {
			args: stories.Default.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Display
				expect(component).toBeVisible();
				expect(component).toHaveClass('supt-input-radio');
				// Label
				const label = component?.querySelector('legend');
				expect(label).toBeInTheDocument();
				expect(label).toHaveTextContent('Label');
				// Radio inputs
				const radioInputs = component?.querySelectorAll(
					'input[type="radio"]'
				);
				expect(radioInputs?.length).toBe(2);
				// Check first option is selected
				const firstRadio = radioInputs?.[0];
				expect(firstRadio).toBeChecked();
				// Check option labels
				expect(component).toHaveTextContent('Choice 1');
				expect(component).toHaveTextContent('Choice 2');
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
