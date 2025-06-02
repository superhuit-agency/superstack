import ParagraphBlock from './block.json';
import { Paragraph } from './index';
import { expect } from '@storybook/test';

export default {
	title: 'Components/Atoms/Paragraph',
	component: Paragraph,
	parameters: {
		layout: 'centered',
	},
	args: {},
	blockConfig: ParagraphBlock,
	getTestableStories: () => [Default, Empty],
} as TestableComponentMeta<typeof Paragraph>;

export const Default: TestableStory<typeof Paragraph> = {
	name: 'Paragraph Default',
	args: {
		content:
			'Excepteur quis aute cupidatat consequat fugiat. Ipsum consectetur laborum reprehenderit Lorem. Sint excepteur aute tempor magna ex culpa dolor do.',
	},
	unitTest: (component: Element | null) => {
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
};

export const Empty: TestableStory<typeof Paragraph> = {
	name: 'Paragraph Empty',
	args: {
		content: '',
	},
	unitTest: (component: Element | null) => {
		// Should not render when content is empty
		expect(component).toBeNull();
	},
};
