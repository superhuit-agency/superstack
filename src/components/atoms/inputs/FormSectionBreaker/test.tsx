import { expect } from '@storybook/test';

import block from './block.json';
import { FormSectionBreaker } from './index';
import * as stories from './FormSectionBreaker.stories';
/**
 * Unique name for the component tests.
 * Returns an object from each storybook story with for each a unit test to run.
 */
export const FormSectionBreakerTests: ComponentTests = {
	block: block,
	component: FormSectionBreaker,
	tests: {
		Default: {
			args: stories.Default.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Display
				expect(component).toBeVisible();
				expect(component).toHaveClass('supt-form-section-breaker');
				// Content
				expect(component).toHaveTextContent('Documents');
				// Structure
				const title = component?.querySelector(
					'.supt-form-section-breaker__title'
				);
				expect(title).toBeInTheDocument();
				expect(title?.tagName.toLowerCase()).toBe('h4');
			},
		},
		Empty: {
			args: stories.Empty.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Display
				expect(component).toBeVisible();
				expect(component).toHaveClass('supt-form-section-breaker');
				// Content should be empty but structure should exist
				const title = component?.querySelector(
					'.supt-form-section-breaker__title'
				);
				expect(title).toBeInTheDocument();
				expect(title?.textContent).toBe('');
			},
		},
	},
};
