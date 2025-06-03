import ListBlock from './block.json';
import { List } from './index';
import { ListItem } from '..';
import { expect } from '@storybook/test';

export default {
	title: 'Components/Atoms/List',
	component: List,
	parameters: {
		layout: 'centered',
	},
	args: {},
	blockConfig: ListBlock,
	getUnitTests: () => [Default, Ordered, OrderedWithCounter, WithEmptyItems],
} as TestableComponentMeta<typeof List>;

export const Default: TestableStory<typeof List> = {
	name: 'List Unordered',
	args: {
		ordered: false,
		children: (
			<>
				<ListItem content="Ullamco dolore laborum cupidatat sint mollit culpa eu esse ipsum deserunt." />
				<ListItem content="Est amet tempor consectetur et laboris eiusmod ullamco velit.">
					<List ordered={false}>
						<ListItem content="Consequat ad non culpa qui qui ea." />
						<ListItem content="Elit exercitation anim fugiat aute nulla." />
					</List>
				</ListItem>
				<ListItem content="Commodo incididunt aliqua cupidatat id quis aliqua.">
					<List ordered={true}>
						<ListItem content="Esse officia amet enim consequat Lorem." />
						<ListItem content="Voluptate reprehenderit non proident." />
					</List>
				</ListItem>
			</>
		),
	},
	unitTest: async (component: Element | null, container: Element | null) => {
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
};

export const Ordered: TestableStory<typeof List> = {
	name: 'List Ordered',
	args: {
		ordered: true,
		children: (
			<>
				<ListItem content="First item" />
				<ListItem content="Second item" />
				<ListItem content="Third item" />
			</>
		),
	},
	unitTest: async (component: Element | null, container: Element | null) => {
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
};

export const OrderedWithCounter: TestableStory<typeof List> = {
	name: 'List Ordered with counter',
	args: {
		ordered: true,
		start: 1,
		children: (
			<>
				<ListItem content="Second item" />
				<ListItem content="Third item" />
				<ListItem content="Fourth item" />
			</>
		),
	},
	unitTest: async (component: Element | null, container: Element | null) => {
		// General
		expect(component).toBeInTheDocument();
		// Display
		expect(component).toBeVisible();
		expect(component).toHaveClass('supt-list');
		// HTML structure - should be ol for ordered
		expect(component?.tagName.toLowerCase()).toBe('ol');
		// Counter
		expect(component).toHaveAttribute('style', 'counter-set: li 2;');
		// Content
		expect(component).toHaveTextContent('Second item');
		expect(component).toHaveTextContent('Third item');
		expect(component).toHaveTextContent('Fourth item');
	},
};

export const WithEmptyItems: TestableStory<typeof List> = {
	name: 'List Ordered with counter',
	args: {
		children: (
			<>
				<ListItem content="First item" />
				<ListItem content="" id="empty-item" />
				<ListItem content="Third item" />
			</>
		),
	},
	unitTest: async (component: Element | null, container: Element | null) => {
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
};
