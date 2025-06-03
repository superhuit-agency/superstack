import InputRadioBlock from './block.json';
import { InputRadio } from './index';
import { expect } from '@storybook/test';

export default {
	title: 'Components/Atoms/Inputs/Input Radio',
	component: InputRadio,
	parameters: {
		layout: 'centered',
	},
	args: {},
	blockConfig: InputRadioBlock,
	getUnitTests: () => [Default, WithError],
} as TestableComponentMeta<typeof InputRadio>;

export const Default: TestableStory<typeof InputRadio> = {
	name: 'InputRadio Default',
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
		expect(component).toHaveClass('supt-input-radio');
		// Label
		const label = component?.querySelector('legend');
		expect(label).toBeInTheDocument();
		expect(label).toHaveTextContent('Label');
		// Radio inputs
		const radioInputs = component?.querySelectorAll('input[type="radio"]');
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
};

export const WithError: TestableStory<typeof InputRadio> = {
	name: 'InputRadio WithError',
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
