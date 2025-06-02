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
	getTestableStories: () => [Default, Filled, WithError],
} as TestableComponentMeta<typeof InputSelect>;

export const Default: TestableStory<typeof InputSelect> = {
	name: 'InputSelect Default',
	args: {
		label: 'Color',
		name: 'color',
		placeholder: 'Select color',
		options: 'red: Red; blue: Blue; orange: Orange;',
	},
	unitTest: (component: Element | null) => {
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
	unitTest: (component: Element | null) => {
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
	unitTest: (component: Element | null) => {
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
