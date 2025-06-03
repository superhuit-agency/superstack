import InputTextareaBlock from './block.json';
import { InputTextarea } from './index';
import { expect } from '@storybook/test';

export default {
	title: 'Components/Atoms/Inputs/Input Textarea',
	component: InputTextarea,
	parameters: {
		layout: 'centered',
	},
	args: {},
	blockConfig: InputTextareaBlock,
	getUnitTests: () => [Default, Filled, WithError],
} as TestableComponentMeta<typeof InputTextarea>;

export const Default: TestableStory<typeof InputTextarea> = {
	name: 'InputTextarea Default',
	args: {
		label: 'Message',
		name: 'message',
		placeholder: 'Lorem ipsum',
	},
	unitTest: async (component: Element | null, container: Element | null) => {
		// General
		expect(component).toBeInTheDocument();
		// Display
		expect(component).toBeVisible();
		expect(component).toHaveClass('supt-input-textarea');
		// Label
		const label = component?.querySelector('label');
		expect(label).toBeInTheDocument();
		expect(label).toHaveTextContent('Message');
		// Textarea
		const textarea = component?.querySelector('textarea');
		expect(textarea).toBeInTheDocument();
		expect(textarea).toHaveAttribute('placeholder', 'Lorem ipsum');
		expect(textarea).toHaveAttribute('name', 'message');
		// No error state
		expect(component).not.toHaveClass('-error');
	},
};

export const Filled: TestableStory<typeof InputTextarea> = {
	name: 'InputTextarea Filled',
	args: {
		label: 'Message',
		name: 'message',
		placeholder: 'Lorem ipsum',
		inputAttributes: {
			value: 'Anim dolor ea culpa reprehenderit minim adipisicing.',
		},
	},
	unitTest: async (component: Element | null, container: Element | null) => {
		// General
		expect(component).toBeInTheDocument();
		// Textarea value
		const textarea = component?.querySelector('textarea');
		expect(textarea).toBeInTheDocument();
		expect(textarea).toHaveValue(
			'Anim dolor ea culpa reprehenderit minim adipisicing.'
		);
	},
};

export const WithError: TestableStory<typeof InputTextarea> = {
	name: 'InputTextarea WithError',
	args: {
		label: 'Message',
		name: 'message',
		placeholder: 'Lorem ipsum',
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
		// Textarea aria-invalid
		const textarea = component?.querySelector('textarea');
		expect(textarea).toHaveAttribute('aria-invalid', 'true');
	},
};
