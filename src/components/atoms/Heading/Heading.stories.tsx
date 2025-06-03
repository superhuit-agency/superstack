import { Heading } from './index';
import HeadingBlock from './block.json';
import { expect } from '@storybook/test';

export default {
	title: 'Components/Atoms/Heading',
	component: Heading,
	parameters: {
		layout: 'centered',
	},
	args: {},
	blockConfig: HeadingBlock,
	getUnitTests: () => [H1, H2, H3, H4, H5, H6, Empty],
} as TestableComponentMeta<typeof Heading>;

export const H1: TestableStory<typeof Heading> = {
	name: 'H1',
	args: {
		content: '<h1>Title</h1>',
		level: 1,
	},
	unitTest: async (component: Element | null, container: Element | null) => {
		// General
		expect(component).toBeInTheDocument();
		// Content
		expect(component).toHaveTextContent('Title');
		// Display
		expect(component).toBeVisible();
		expect(component).toHaveClass('supt-heading', { exact: true });
		// Accessibility
		expect(component).toHaveRole('heading');
		expect(component).toHaveAttribute('aria-level', '1');
	},
};

export const H2: TestableStory<typeof Heading> = {
	name: 'H2',
	args: {
		content: '<h2>Subtitle 2</h2>',
		level: 2,
	},
	unitTest: async (component: Element | null, container: Element | null) => {
		// General
		expect(component).toBeInTheDocument();
		// Content
		expect(component).toHaveTextContent('Subtitle 2');
		// Display
		expect(component).toBeVisible();
		expect(component).toHaveClass('supt-heading', { exact: true });
		// Accessibility
		expect(component).toHaveRole('heading');
		expect(component).toHaveAttribute('aria-level', '2');
	},
};

export const H3: TestableStory<typeof Heading> = {
	name: 'H3',
	args: {
		content: 'Subtitle 3',
		level: 3,
	},
	unitTest: async (component: Element | null, container: Element | null) => {
		// General
		expect(component).toBeInTheDocument();
		// Content
		expect(component).toHaveTextContent('Subtitle 3');
		// Display
		expect(component).toBeVisible();
		expect(component).toHaveClass('supt-heading', { exact: true });
		// Accessibility
		expect(component).toHaveRole('heading');
		expect(component).toHaveAttribute('aria-level', '3');
	},
};

export const H4: TestableStory<typeof Heading> = {
	name: 'H4',
	args: {
		content: '<h4>Subtitle 4</h4>',
		level: 4,
	},
	unitTest: async (component: Element | null, container: Element | null) => {
		// General
		expect(component).toBeInTheDocument();
		// Content
		expect(component).toHaveTextContent('Subtitle 4');
		// Display
		expect(component).toBeVisible();
		expect(component).toHaveClass('supt-heading', { exact: true });
		// Accessibility
		expect(component).toHaveRole('heading');
		expect(component).toHaveAttribute('aria-level', '4');
	},
};

export const H5: TestableStory<typeof Heading> = {
	name: 'H5',
	args: {
		content: '<h5>Subtitle 5</h5>',
		level: 5,
	},
	unitTest: async (component: Element | null, container: Element | null) => {
		// General
		expect(component).toBeInTheDocument();
		// Content
		expect(component).toHaveTextContent('Subtitle 5');
		// Display
		expect(component).toBeVisible();
		expect(component).toHaveClass('supt-heading', { exact: true });
		// Accessibility
		expect(component).toHaveRole('heading');
		expect(component).toHaveAttribute('aria-level', '5');
	},
};

export const H6: TestableStory<typeof Heading> = {
	name: 'H6',
	args: {
		content: '<h6>Subtitle 6</h6>',
		level: 6,
	},
	unitTest: async (component: Element | null, container: Element | null) => {
		// General
		expect(component).toBeInTheDocument();
		// Content
		expect(component).toHaveTextContent('Subtitle 6');
		// Display
		expect(component).toBeVisible();
		expect(component).toHaveClass('supt-heading', { exact: true });
		// Accessibility
		expect(component).toHaveRole('heading');
		expect(component).toHaveAttribute('aria-level', '6');
	},
};

export const Empty: TestableStory<typeof Heading> = {
	name: 'Invalid',
	args: {
		content: '',
		level: 0,
	},
	unitTest: async (component: Element | null, container: Element | null) => {
		// General
		expect(component).toBeNull();
	},
};
