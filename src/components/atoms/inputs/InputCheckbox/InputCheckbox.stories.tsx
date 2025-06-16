import InputCheckboxBlock from './block.json';
import { InputCheckbox } from './index';
import { expect, waitFor } from '@storybook/test';

export default {
	title: 'Components/Atoms/Inputs/Input Checkbox',
	component: InputCheckbox,
	parameters: {
		layout: 'centered',
	},
	args: {},
	blockConfig: InputCheckboxBlock,
	getUnitTests: () => [Default, WithError],
} as TestableComponentMeta<typeof InputCheckbox>;

export const Default: TestableStory<typeof InputCheckbox> = {
	name: 'InputCheckbox Default',
	args: {
		label: 'Label',
		name: 'name',
		options: [
			{
				attrs: {
					name: 'name',
					label: 'Choice 1',
					value: 'choice-1',
					defaultChecked: true,
				},
			},
			{
				attrs: {
					name: 'name',
					label: 'Choice 2',
					value: 'choice-2',
				},
			},
		],
	},
	unitTest: async (component: Element | null, container: Element | null) => {
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

		// Test clicking first checkbox doesn't trigger error
		secondCheckbox?.dispatchEvent(new Event('change'));
		secondCheckbox?.dispatchEvent(new Event('click'));
		secondCheckbox?.dispatchEvent(new Event('blur'));

		// No error state
		expect(component).not.toHaveClass('-error');
	},
};

export const WithError: TestableStory<typeof InputCheckbox> = {
	name: 'InputCheckbox WithError',
	args: {
		label: 'Label',
		name: 'name',
		options: [
			{
				attrs: {
					name: 'name',
					label: 'Choice 1',
					value: 'choice-1',
					defaultChecked: true,
				},
			},
			{
				attrs: {
					name: 'name',
					label: 'Choice 2',
					value: 'choice-2',
				},
			},
		],
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
	},
};
