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
	getTestableStories: () => [H1, H2, H3, H4, H5, H6, Empty],
} as TestableComponentMeta<typeof Heading>;

export const H1: TestableStory<typeof Heading> = {
	name: 'H1',
	args: {
		content: 'Title',
		level: 1,
	},
	unitTest: (component: Element | null) => {
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
		content: 'Subtitle 2',
		level: 2,
	},
	unitTest: (component: Element | null) => {
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
	unitTest: (component: Element | null) => {
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
		content: 'Subtitle 4',
		level: 4,
	},
	unitTest: (component: Element | null) => {
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
		content: 'Subtitle 5',
		level: 5,
	},
	unitTest: (component: Element | null) => {
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
		content: 'Subtitle 6',
		level: 6,
	},
	unitTest: (component: Element | null) => {
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
	unitTest: (component: Element | null) => {
		// General
		expect(component).toBeNull();
	},
};
