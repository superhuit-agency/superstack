import { expect } from '@storybook/test';

import block from './block.json';
import { Heading } from './index';
import * as stories from './Heading.stories';
/**
 * Unique name for the component tests.
 * Returns an object from each storybook story with for each a unit test to run.
 */
export const HeadingTests: ComponentTests = {
	block: block,
	component: Heading,
	tests: {
		H1: {
			args: stories.H1.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Content
				expect(component).toHaveTextContent('Main Title');
				// Display
				expect(component).toBeVisible();
				expect(component).toHaveClass('supt-heading', { exact: true });
				// Accessibility
				expect(component).toHaveRole('heading');
			},
		},
		H2: {
			args: stories.H2.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Content
				expect(component).toHaveTextContent('Subtitle 2');
				// Display
				expect(component).toBeVisible();
				expect(component).toHaveClass('supt-heading', { exact: true });
				// Accessibility
				expect(component).toHaveRole('heading');
			},
		},
		H3: {
			args: stories.H3.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Content
				expect(component).toHaveTextContent('Subtitle 3');
				// Display
				expect(component).toBeVisible();
				expect(component).toHaveClass('supt-heading', { exact: true });
				// Accessibility
				expect(component).toHaveRole('heading');
			},
		},
		H4: {
			args: stories.H4.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Content
				expect(component).toHaveTextContent('Subtitle 4');
				// Display
				expect(component).toBeVisible();
				expect(component).toHaveClass('supt-heading', { exact: true });
				// Accessibility
				expect(component).toHaveRole('heading');
			},
		},
		H5: {
			args: stories.H5.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Content
				expect(component).toHaveTextContent('Subtitle 5');
				// Display
				expect(component).toBeVisible();
				expect(component).toHaveClass('supt-heading', { exact: true });
				// Accessibility
				expect(component).toHaveRole('heading');
			},
		},
		H6: {
			args: stories.H6.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Content
				expect(component).toHaveTextContent('Subtitle 6');
				// Display
				expect(component).toBeVisible();
				expect(component).toHaveClass('supt-heading', { exact: true });
				// Accessibility
				expect(component).toHaveRole('heading');
			},
		},
		Invalid: {
			args: stories.Invalid.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeNull();
			},
		},
	},
};
