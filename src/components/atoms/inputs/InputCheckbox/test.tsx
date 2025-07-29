import { act } from '@testing-library/react';
import { expect, fireEvent } from '@storybook/test';

import block from './block.json';
import { InputCheckbox } from './index';
import * as stories from './InputCheckbox.stories';
/**
 * Unique name for the component tests.
 * Returns an object from each storybook story with for each a unit test to run.
 */
export const InputCheckboxTests: ComponentTests = {
	block: block,
	component: InputCheckbox,
	tests: {
		Default: {
			args: stories.Default.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Display
				expect(component).toBeVisible();
				expect(component).toHaveClass('supt-input-checkbox');
				// Label
				const label = component?.querySelector('legend');
				expect(label).toBeInTheDocument();
				expect(label).toHaveTextContent('Label');
				// Checkbox inputs
				const checkboxInputs = component?.querySelectorAll(
					'input[type="checkbox"]'
				);
				expect(checkboxInputs?.length).toBe(2);
				// Check first option is selected
				const firstCheckbox = checkboxInputs?.[0];
				expect(firstCheckbox).toBeChecked();
				const secondCheckbox = checkboxInputs?.[1];
				expect(secondCheckbox).not.toBeChecked();
				// Check option labels
				expect(component).toHaveTextContent('Choice 1');
				expect(component).toHaveTextContent('Choice 2');
				act(() => {
					// Test clicking second checkbox selects 1 & 2
					fireEvent.click(secondCheckbox!);
					expect(firstCheckbox).toBeChecked();
					expect(secondCheckbox).toBeChecked();
					// Test clicking first checkbox selects 2
					fireEvent.click(firstCheckbox!);
					expect(firstCheckbox).not.toBeChecked();
					expect(secondCheckbox).toBeChecked();
				});
				// No error state
				expect(component).not.toHaveClass('-error');
			},
		},
		WithNoValue: {
			args: stories.WithNoValue.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Checkbox inputs
				const checkboxInputs = component?.querySelectorAll(
					'input[type="checkbox"]'
				);
				expect(checkboxInputs?.length).toBe(3);
				// Check first option is selected
				const firstCheckbox = checkboxInputs?.[0];
				expect(firstCheckbox).toHaveAttribute(
					'value',
					'the_fellowship_of_the_ring'
				);
			},
		},
		WithIdAndNoLabel: {
			args: stories.WithIdAndNoLabel.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Checkbox inputs
				const checkboxInputs = component?.querySelectorAll(
					'input[type="checkbox"]'
				);
				expect(checkboxInputs?.length).toBe(2);
				// Check first option is selected
				const firstCheckbox = checkboxInputs?.[0];
				const secondCheckbox = checkboxInputs?.[1];
				expect(firstCheckbox).not.toBeChecked();
				// TODO: this should work
				// expect(firstCheckbox).toHaveAttribute('id', 'choice-1-id');
				expect(secondCheckbox).not.toBeChecked();
				// TODO: this should work
				// expect(secondCheckbox).toHaveAttribute('id', 'choice-2-id');
				act(() => {
					// Test clicking
					fireEvent.click(firstCheckbox!);
					expect(firstCheckbox).toBeChecked();
					expect(secondCheckbox).not.toBeChecked();
					fireEvent.click(secondCheckbox!);
					expect(firstCheckbox).toBeChecked();
					expect(secondCheckbox).toBeChecked();
				});
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
