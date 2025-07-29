// import { Link } from '.';
// import { expect } from '@storybook/test';

// export default {
// 	// Inherited from Storybook, must be the Path to the component in the Storybook UI
// 	title: 'Components/Atoms/Link',
// 	component: Link,
// 	parameters: {
// 		layout: 'centered',
// 	},
// 	args: {},
// 	blockConfig: {
// 		slug: 'supt/link',
// 		title: 'Link',
// 	},
// 	getUnitTests: () => [
// 		Anchor,
// 		External,
// 		Internal,
// 		DownloadInternal,
// 		Download,
// 	],
// } as TestableComponentMeta<typeof Link>;

// export const Anchor: TestableStory<typeof Link> = {
// 	name: 'Anchor Link',
// 	args: {
// 		children: <span>this is an anchor</span>,
// 		href: '#anchor',
// 	},
// 	unitTest: async (component: Element | null, container: Element | null) => {
// 		// General
// 		expect(component).toBeInTheDocument();
// 		// Content
// 		expect(component).toHaveTextContent('this is an anchor');
// 		// Display
// 		expect(component).toBeVisible();
// 		// Accessibility
// 		expect(component).toBeEnabled();
// 		expect(component).toHaveRole('link');
// 	},
// };

// export const External: TestableStory<typeof Link> = {
// 	name: 'External Link',
// 	args: {
// 		children: <span>this is an external link</span>,
// 		href: 'https://superhuit.ch',
// 	},
// 	unitTest: async (component: Element | null, container: Element | null) => {
// 		// General
// 		expect(component).toBeInTheDocument();
// 		// Content
// 		expect(component).toHaveTextContent('this is an external link');
// 		// Display
// 		expect(component).toBeVisible();
// 		// Accessibility
// 		expect(component).toBeEnabled();
// 		expect(component).toHaveRole('link');
// 		expect(component).toHaveAttribute('target', '_blank');
// 	},
// };

// export const Internal: TestableStory<typeof Link> = {
// 	name: 'Internal Link',
// 	args: {
// 		children: <span>this is an internal link</span>,
// 		href: '/blog/hello-world',
// 	},
// 	unitTest: async (component: Element | null, container: Element | null) => {
// 		// General
// 		expect(component).toBeInTheDocument();
// 		// Content
// 		expect(component).toHaveTextContent('this is an internal link');
// 		// Display
// 		expect(component).toBeVisible();
// 		// Accessibility
// 		expect(component).toBeEnabled();
// 		expect(component).toHaveRole('link');
// 		expect(component).not.toHaveAttribute('target', '_blank');
// 	},
// };

// export const DownloadInternal: TestableStory<typeof Link> = {
// 	name: 'Internal Download Link',
// 	args: {
// 		children: <span>this is an internal download link</span>,
// 		href: '/wp-content/uploads/test.pdf',
// 		download: true,
// 	},
// 	unitTest: async (component: Element | null, container: Element | null) => {
// 		// General
// 		expect(component).toBeInTheDocument();
// 		// Content
// 		expect(component).toHaveTextContent(
// 			'this is an internal download link'
// 		);
// 		// Display
// 		expect(component).toBeVisible();
// 		// Accessibility
// 		expect(component).toBeEnabled();
// 		expect(component).toHaveRole('link');
// 		expect(component).toHaveAttribute('download');
// 		expect(component).not.toHaveAttribute('target');
// 	},
// };

// export const Download: TestableStory<typeof Link> = {
// 	name: 'External Download Link',
// 	args: {
// 		children: <span>this is an external download link</span>,
// 		href: 'https://superhuit.ch',
// 		download: true,
// 	},
// 	unitTest: async (component: Element | null, container: Element | null) => {
// 		// General
// 		expect(component).toBeInTheDocument();
// 		// Content
// 		expect(component).toHaveTextContent(
// 			'this is an external download link'
// 		);
// 		// Display
// 		expect(component).toBeVisible();
// 		// Accessibility
// 		expect(component).toBeEnabled();
// 		expect(component).toHaveRole('link');
// 		expect(component).toHaveAttribute('download');
// 		expect(component).not.toHaveAttribute('target');
// 	},
// };
