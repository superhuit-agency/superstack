import { act } from '@testing-library/react';
import { expect, fireEvent } from '@storybook/test';

import block from './block.json';
import { InputSelect } from './index';
import * as stories from './InputSelect.stories';
/**
 * Unique name for the component tests.
 * Returns an object from each storybook story with for each a unit test to run.
 */
export const InputSelectTests: ComponentTests = {
	block: block,
	component: InputSelect,
	tests: {
		Default: {
			args: stories.Default.args,
			unitTest: async (component, container) => {
				act(() => {
					// General
					expect(component).toBeInTheDocument();
					// Display
					expect(component).toBeVisible();
					expect(component).toHaveClass('supt-input-select');
					// Accessibility
					const label = component?.querySelector('label');
					expect(label).toBeInTheDocument();
					expect(label).toHaveTextContent('Color');
					expect(component).not.toHaveClass('-error');
				});
			},
		},
		Filled: {
			args: stories.Filled.args,
			unitTest: async (component, container) => {
				act(() => {
					// General
					expect(component).toBeInTheDocument();
					// Display
					expect(component).toBeVisible();
					expect(component).toHaveClass('supt-input-select');
					// Form Data
					const input = component?.querySelector(
						'input[type="hidden"]'
					);
					expect(input).toBeInTheDocument();
					expect(input).toHaveValue('orange');
					// Accessibility
					const label = component?.querySelector('label');
					expect(label).toBeInTheDocument();
					expect(label).toHaveTextContent('Color');

					// Test dropdown interaction
					const combobox = component?.querySelector(
						'input[role="combobox"]'
					);
					expect(combobox).toBeInTheDocument();
					// Click to open dropdown
					// act(() => {
					// 	(combobox as HTMLElement).click();
					// });
					// // Check dropdown menu does not appear
					// const menu = component?.querySelector('.supt-input-select__menu-list');
					// expect(menu).toBeInTheDocument();
					// expect(menu).toBeVisible();

					// // Check options are displayed
					// const options = component?.querySelectorAll(
					// 	'.supt-input-select__option'
					// );
					// expect(options).toHaveLength(3);
				});
			},
		},
		Disabled: {
			args: stories.Disabled.args,
			unitTest: async (component, container) => {
				act(() => {
					// General
					expect(component).toBeInTheDocument();
					// Display
					expect(component).toBeVisible();
					expect(component).toHaveClass('supt-input-select');
					// Accessibility
					const label = component?.querySelector('label');
					expect(label).toBeInTheDocument();
					expect(label).toHaveTextContent(
						'This is a disabled select'
					);
					// Disabled
					const select = component?.querySelector(
						'input[role="combobox"]'
					);
					expect(select).toHaveAttribute('disabled');
					// Click to open dropdown
					// act(() => {
					// 	(select as any).click();
					// });
					// // Check dropdown menu does not appear
					// const menu = component?.querySelector('.supt-input-select__menu-list');
					// expect(menu).toBeNull();
				});
			},
		},
		WithError: {
			args: stories.WithError.args,
			unitTest: async (component, container) => {
				act(() => {
					// General
					expect(component).toBeInTheDocument();
					// Error state
					expect(component).toHaveClass('-error');
					// Error message
					const errorElement =
						component?.querySelector('[role="alert"]');
					expect(errorElement).toBeInTheDocument();
					expect(errorElement).toHaveTextContent('Error message');
					// Accessibility
					const select = component?.querySelector(
						'input[role="combobox"]'
					);
					expect(select).toHaveAttribute('aria-invalid', 'true');
				});
			},
		},
	},
};
