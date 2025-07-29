import { expect } from '@storybook/test';

import block from './block.json';
import { Paragraph } from './index';
import * as stories from './Paragraph.stories';
/**
 * Unique name for the component tests.
 * Returns an object from each storybook story with for each a unit test to run.
 */
export const ParagraphTests: ComponentTests = {
	block: block,
	component: Paragraph,
	tests: {
		Default: {
			args: stories.Default.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeInTheDocument();
				// Content
				expect(component).toHaveTextContent(
					'Excepteur quis aute cupidatat consequat fugiat'
				);
				// Display
				expect(component).toBeVisible();
				expect(component).toHaveClass('supt-paragraph');
				// HTML structure
				expect(component?.tagName.toLowerCase()).toBe('p');
			},
		},
		Empty: {
			args: stories.Empty.args,
			unitTest: async (component, container) => {
				// Should not render when content is empty
				expect(component).toBeNull();
			},
		},
	},
};
