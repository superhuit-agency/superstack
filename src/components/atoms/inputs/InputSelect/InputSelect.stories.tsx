import InputSelectBlock from './block.json';
import { InputSelect } from './index';
import { expect } from '@storybook/test';

export default {
	title: 'Components/Atoms/Inputs/Input Select',
	component: InputSelect,
	parameters: {
		layout: 'centered',
	},
	args: {},
	blockConfig: InputSelectBlock,
	getUnitTests: () => [Default, Filled, Disabled, WithError],
} as TestableComponentMeta<typeof InputSelect>;

export const Default: TestableStory<typeof InputSelect> = {
	name: 'InputSelect Default',
	args: {
		label: 'Color',
		name: 'color',
		placeholder: 'Select color',
		options: 'red: Red; blue: Blue; orange: Orange;',
	},
	unitTest: async (component: Element | null, container: Element | null) => {
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
	},
};

export const Filled: TestableStory<typeof InputSelect> = {
	name: 'InputSelect Filled',
	args: {
		label: 'Color',
		name: 'color',
		placeholder: 'Select color',
		options: 'red: Red; blue: Blue; orange: Orange;',
		value: 'orange',
	},
	unitTest: async (component: Element | null, container: Element | null) => {
		// General
		expect(component).toBeInTheDocument();
		// Display
		expect(component).toBeVisible();
		expect(component).toHaveClass('supt-input-select');
		// Form Data
		const input = component?.querySelector('input[type="hidden"]');
		expect(input).toBeInTheDocument();
		expect(input).toHaveValue('orange');
		// Accessibility
		const label = component?.querySelector('label');
		expect(label).toBeInTheDocument();
		expect(label).toHaveTextContent('Color');

		// Test dropdown interaction
		const combobox = component?.querySelector('input[role="combobox"]');
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
	},
};

export const Disabled: TestableStory<typeof InputSelect> = {
	name: 'InputSelect Disabled',
	args: {
		label: 'This is a disabled select',
		name: 'disabled',
		placeholder: 'Select a country',
		options: 'France: France; Switzerland: Switzerland; Germany: Germany;',
		disabled: true,
	},
	unitTest: async (component: Element | null, container: Element | null) => {
		// General
		expect(component).toBeInTheDocument();
		// Display
		expect(component).toBeVisible();
		expect(component).toHaveClass('supt-input-select');
		// Accessibility
		const label = component?.querySelector('label');
		expect(label).toBeInTheDocument();
		expect(label).toHaveTextContent('This is a disabled select');
		// Disabled
		const select = component?.querySelector('input[role="combobox"]');
		expect(select).toHaveAttribute('disabled');
		// Click to open dropdown
		// act(() => {
		// 	(select as any).click();
		// });
		// // Check dropdown menu does not appear
		// const menu = component?.querySelector('.supt-input-select__menu-list');
		// expect(menu).toBeNull();
	},
};

export const WithError: TestableStory<typeof InputSelect> = {
	name: 'InputSelect WithError',
	args: {
		label: 'Color',
		name: 'color',
		placeholder: 'Select color',
		options: 'red: Red; blue: Blue; orange: Orange;',
		invalid: 'Error message',
	},
	unitTest: async (component: Element | null, container: Element | null) => {
		// General
		expect(component).toBeInTheDocument();
		// Error state
		expect(component).toHaveClass('-error');
		// Error message
		const errorElement = component?.querySelector('[role="alert"]');
		expect(errorElement).toBeInTheDocument();
		expect(errorElement).toHaveTextContent('Error message');
		// Accessibility
		const select = component?.querySelector('input[role="combobox"]');
		expect(select).toHaveAttribute('aria-invalid', 'true');
	},
};
