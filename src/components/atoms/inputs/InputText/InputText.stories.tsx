import InputTextBlock from './block.json';
import { InputText } from './index';
import { expect } from '@storybook/test';

export default {
	title: 'Components/Atoms/Inputs/Input Text',
	component: InputText,
	parameters: {
		layout: 'centered',
	},
	args: {},
	blockConfig: InputTextBlock,
	getTestableStories: () => [Default, Filled, WithError],
} as TestableComponentMeta<typeof InputText>;

export const Default: TestableStory<typeof InputText> = {
	name: 'InputText Default',
	args: {
		label: 'Name',
		name: 'name',
		placeholder: 'John Doe',
	},
	unitTest: (component: Element | null) => {
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
};

export const Filled: TestableStory<typeof InputText> = {
	name: 'InputText Filled',
	args: {
		label: 'Name',
		name: 'name',
		placeholder: 'John Doe',
		inputAttributes: {
			value: 'Jane Doe',
		},
	},
	unitTest: (component: Element | null) => {
		// General
		expect(component).toBeInTheDocument();
		// Input value
		const input = component?.querySelector('input');
		expect(input).toBeInTheDocument();
		expect(input).toHaveValue('Jane Doe');
	},
};

export const WithError: TestableStory<typeof InputText> = {
	name: 'InputText WithError',
	args: {
		label: 'Name',
		name: 'name',
		placeholder: 'John Doe',
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
		// Input aria-invalid
		const input = component?.querySelector('input');
		expect(input).toHaveAttribute('aria-invalid', 'true');
	},
};
