import InputEmailBlock from './block.json';
import { InputEmail } from './index';
import { expect } from '@storybook/test';

export default {
	title: 'Components/Atoms/Inputs/Input Email',
	component: InputEmail,
	parameters: {
		layout: 'centered',
	},
	args: {},
	blockConfig: InputEmailBlock,
	getUnitTests: () => [Default, Filled, WithError],
} as TestableComponentMeta<typeof InputEmail>;

export const Default: TestableStory<typeof InputEmail> = {
	name: 'Classic Email Input',
	args: {
		label: 'Email',
		name: 'email',
		placeholder: 'john@example.com',
	},
	unitTest: async (component: Element | null, container: Element | null) => {
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
		expect(input).toHaveAttribute('placeholder', 'john@example.com');
		expect(input).toHaveAttribute('name', 'email');
		expect(input).toHaveAttribute('type', 'email');
		// No error state
		expect(component).not.toHaveClass('-error');
	},
};

export const Filled: TestableStory<typeof InputEmail> = {
	name: 'InputEmail Filled',
	args: {
		label: 'Email',
		name: 'email',
		placeholder: 'john@example.com',
		inputAttributes: {
			value: 'jane@example.com',
		},
	},
	unitTest: async (component: Element | null, container: Element | null) => {
		// General
		expect(component).toBeInTheDocument();
		// Input value
		const input = component?.querySelector('input');
		expect(input).toBeInTheDocument();
		expect(input).toHaveValue('jane@example.com');
	},
};

export const WithError: TestableStory<typeof InputEmail> = {
	name: 'InputEmail WithError',
	args: {
		label: 'Email',
		name: 'email',
		placeholder: 'john@example.com',
		invalid: 'Please enter a valid email address',
	},
	unitTest: async (component: Element | null, container: Element | null) => {
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
};
