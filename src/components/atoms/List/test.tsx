import { expect } from '@storybook/test';

import block from './block.json';
import { List } from './index';
import * as stories from './List.stories';
/**
 * Unique name for the component tests.
 * Returns an object from each storybook story with for each a unit test to run.
 */
export const ListTests: ComponentTests = {
	block: block,
	component: List,
	tests: {
		Default: {
			args: stories.Default.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Display
				expect(component).toBeVisible();
				expect(component).toHaveClass('supt-list');
				// HTML structure - should be ul for unordered
				expect(component?.tagName.toLowerCase()).toBe('ul');
				// Content - should contain list items
				const listItems = component?.querySelectorAll('li');
				expect(listItems?.length).toBeGreaterThan(0);
			},
		},
		Ordered: {
			args: stories.Ordered.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Display
				expect(component).toBeVisible();
				expect(component).toHaveClass('supt-list');
				// HTML structure - should be ol for ordered
				expect(component?.tagName.toLowerCase()).toBe('ol');
				// Content
				expect(component).toHaveTextContent('First item');
				expect(component).toHaveTextContent('Second item');
				expect(component).toHaveTextContent('Third item');
			},
		},
		OrderedWithCounter: {
			args: stories.OrderedWithCounter.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Display
				expect(component).toBeVisible();
				expect(component).toHaveClass('supt-list');
				// HTML structure - should be ol for ordered
				expect(component?.tagName.toLowerCase()).toBe('ol');
				// Counter
				expect(component).toHaveAttribute(
					'style',
					'counter-set: li 2;'
				);
				// Content
				expect(component).toHaveTextContent('Second item');
				expect(component).toHaveTextContent('Third item');
				expect(component).toHaveTextContent('Fourth item');
			},
		},
		WithEmptyItems: {
			args: stories.WithEmptyItems.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Display
				expect(component).toBeVisible();
				expect(component).toHaveClass('supt-list');
				// Content
				expect(component).toHaveTextContent('First item');
				expect(component).toHaveTextContent('Third item');
				// Empty item
				const emptyItem = component?.querySelector('#empty-item');
				expect(emptyItem).toBeNull();
			},
		},
	},
};
