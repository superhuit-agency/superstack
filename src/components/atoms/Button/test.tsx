import { expect } from '@storybook/test';

import block from './block.json';
import { Button } from './index';
import * as stories from './Button.stories';
/**
 * Unique name for the component tests.
 * Returns an object from each storybook story with for each a unit test to run.
 */
export const ButtonTests: ComponentTests = {
	block: block,
	component: Button,
	tests: {
		Primary: {
			args: stories.Primary.args,
			unitTest: async (component, container) => {
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
		},
		Secondary: {
			args: stories.Secondary.args,
			unitTest: async (component, container) => {
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
		},
		Submit: {
			args: stories.Submit.args,
			unitTest: async (component, container) => {
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
		},
		Download: {
			args: stories.Download.args,
			unitTest: async (component, container) => {
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
		},
		External: {
			args: stories.External.args,
			unitTest: async (component, container) => {
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
		},
		Empty: {
			args: stories.Empty.args,
			unitTest: async (component, container) => {
				// General
				expect(component).toBeNull();
			},
		},
	},
};
