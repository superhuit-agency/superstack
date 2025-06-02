import FormSectionBreakerBlock from './block.json';
import { FormSectionBreaker } from './index';
import { expect } from '@storybook/test';

export default {
	title: 'Components/Atoms/FormSectionBreaker',
	component: FormSectionBreaker,
	parameters: {
		layout: 'centered',
	},
	args: {},
	blockConfig: FormSectionBreakerBlock,
	getTestableStories: () => [Default, Empty],
} as TestableComponentMeta<typeof FormSectionBreaker>;

export const Default: TestableStory<typeof FormSectionBreaker> = {
	name: 'FormSectionBreaker Default',
	args: {
		title: 'Documents',
	},
	unitTest: (component: Element | null) => {
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
};

export const Empty: TestableStory<typeof FormSectionBreaker> = {
	name: 'FormSectionBreaker Empty',
	args: {
		title: '',
	},
	unitTest: (component: Element | null) => {
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
};
