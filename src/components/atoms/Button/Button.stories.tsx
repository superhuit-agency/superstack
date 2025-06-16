import ButtonBlock from './block.json';
import { Button } from '.';
import { expect } from '@storybook/test';

export default {
	// Inherited from Storybook, must be the Path to the component in the Storybook UI
	title: 'Components/Atoms/Button',
	component: Button,
	parameters: {
		layout: 'centered',
	},
	args: {},
	blockConfig: ButtonBlock,
	getUnitTests: () => [Primary, Secondary, Submit, Download, External, Empty],
} as TestableComponentMeta<typeof Button>;

export const Primary: TestableStory<typeof Button> = {
	name: 'Button Primary',
	args: {
		title: 'Button Primary',
		href: '#',
	},
	unitTest: async (component: Element | null, container: Element | null) => {
		// General
		expect(component).toBeInTheDocument();
		// Content
		expect(component).toHaveTextContent('Button Primary');
		// Display
		expect(component).toBeVisible();
		expect(component).toHaveClass('supt-button -primary', {
			exact: true,
		});
		// Accessibility
		expect(component).toBeEnabled();
		expect(component).toHaveRole('link');
	},
};

export const Secondary: TestableStory<typeof Button> = {
	name: 'Button Secondary',
	args: {
		title: 'Button Secondary',
		href: '#',
		variant: 'secondary',
	},
	unitTest: async (component: Element | null, container: Element | null) => {
		// General
		expect(component).toBeInTheDocument();
		// Content
		expect(component).toHaveTextContent('Button Secondary');
		// Display
		expect(component).toBeVisible();
		expect(component).toHaveClass('supt-button -secondary', {
			exact: true,
		});
		// Accessibility
		expect(component).toBeEnabled();
		expect(component).toHaveRole('link');
	},
};

export const Submit: TestableStory<typeof Button> = {
	name: 'Button Submit',
	args: {
		type: 'submit',
		title: 'Submit Form',
	},
	unitTest: async (component: Element | null, container: Element | null) => {
		// General
		expect(component).toBeInTheDocument();
		// Content
		expect(component).toHaveTextContent('Submit Form');
		// Display
		expect(component).toBeVisible();
		expect(component).toHaveClass('supt-button -primary', {
			exact: true,
		});
		// Accessibility
		expect(component).toBeEnabled();
		expect(component).toHaveRole('button');
	},
};

export const Download: TestableStory<typeof Button> = {
	name: 'Button Download',
	args: {
		download: true,
		title: 'Download file',
		href: '/file.pdf',
	},
	unitTest: async (component: Element | null, container: Element | null) => {
		// General
		expect(component).toBeInTheDocument();
		// Content
		expect(component).toHaveTextContent('Download file');
		// Display
		expect(component).toBeVisible();
		expect(component).toHaveClass('supt-button -primary', {
			exact: true,
		});
		// Accessibility
		expect(component).toHaveRole('link');
		expect(component).toBeEnabled();
	},
};

export const External: TestableStory<typeof Button> = {
	name: 'Button External',
	args: {
		title: 'Made by Superhuit',
		href: 'https://superhuit.ch',
		target: '_blank',
	},
	unitTest: async (component: Element | null, container: Element | null) => {
		// General
		expect(component).toBeInTheDocument();
		// Content
		expect(component).toHaveTextContent('Made by Superhuit');
		// Display
		expect(component).toBeVisible();
		expect(component).toHaveClass('supt-button -primary', {
			exact: true,
		});
		// Accessibility
		expect(component).toBeEnabled();
		expect(component).toHaveRole('link');
		expect(component).toHaveAttribute('target', '_blank');
	},
};

export const Empty: TestableStory<typeof Button> = {
	name: 'Button Empty',
	args: {
		title: undefined,
		href: 'https://superhuit.ch',
		target: '_blank',
	},
	unitTest: async (component: Element | null, container: Element | null) => {
		// General
		expect(component).toBeNull();
	},
};
