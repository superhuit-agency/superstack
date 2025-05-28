/**
 * Override the default "jsdom" environment to use node for Puppeteer
 * @jest-environment node
 */

import { Browser } from 'puppeteer';
import { Page } from 'puppeteer';
import { Stories as AllTestableComponents } from '@/components/stories';

const puppeteer = require('puppeteer');

const WORDPRESS_ADMIN_USER = 'superstack';
const WORDPRESS_ADMIN_PASSWORD = 'wuzge-rug648RTWG';

// Define testable components directly to avoid Storybook imports
const testableComponents = AllTestableComponents.map((component) => ({
	blockConfig: {
		title: component.blockConfig.title,
		slug: component.blockConfig.slug,
	},
}));

describe('Admin: Create a page to test all the blocks', () => {
	let browser: Browser;
	let page: Page;
	const test_id = 'test-' + Math.random().toString(36).substring(2, 10);

	beforeAll(async () => {
		browser = await puppeteer.launch({
			headless: false,
		});
		page = await browser.newPage();

		// Set a reasonable viewport size
		await page.setViewport({ width: 960, height: 800 });

		// // Enable console logging from the browser
		// page.on('console', (msg) =>
		// 	console.log('Browser console:', msg.text())
		// );

		// // Enable request logging
		// page.on('request', (request) => console.log('Request:', request.url()));
		// page.on('requestfailed', (request) =>
		// 	console.log('Failed request:', request.url())
		// );
	});

	it('should open the admin and login', async () => {
		// Go to the admin page
		await page.goto('http://localhost/wp-admin/');
		// Find out if we need to login (url changed to wp-login.php)
		const url = await page.url();
		if (url.includes('wp-login.php')) {
			// Find the username input and type the username
			await page.waitForSelector('#user_login');
			await page.type('#user_login', WORDPRESS_ADMIN_USER);
			// Find the password input and type the password
			await page.waitForSelector('#user_pass');
			await page.type('#user_pass', WORDPRESS_ADMIN_PASSWORD);
			// Find the login button and click it
			await page.click('#wp-submit');
			// Wait for the page to load
			await page.waitForNavigation();
		}
	});

	it('should open the admin to create a new page', async () => {
		// Go to the admin page to create a new page
		await page.goto(
			'http://localhost/wp-admin/post-new.php?post_type=page'
		);
	});

	for (const blockStory of testableComponents) {
		let blockTitle = blockStory.blockConfig.title ?? '';
		let blockSlug = blockStory.blockConfig.slug ?? '';
		let blockClassName = blockSlug.replace('core/', '').replace(/\//g, '-');

		it('should add the ' + blockTitle + ' block to the page', async () => {
			// Find the "+" button on the top left of the page
			await page.waitForSelector(
				'button.components-button.editor-document-tools__inserter-toggle'
			);
			// Click on the "+" button
			await page.click(
				'button.components-button.editor-document-tools__inserter-toggle'
			);
			// Find the "Search input" in the inserter
			await page.waitForSelector('input.components-input-control__input');
			// Type the block name in the search input
			await page.type(
				'input.components-input-control__input',
				blockTitle
			);
			// Wait and find the first component in the list
			await page.waitForSelector(
				'.block-editor-block-types-list button.editor-block-list-item-' +
					blockClassName
			);
			// Click on it
			await page.click(
				'.block-editor-block-types-list button.editor-block-list-item-' +
					blockClassName
			);
			// Close the Blocks inserter panel
			await page.click(
				'.components-button.editor-document-tools__inserter-toggle.is-pressed'
			);
		});
	}

	it('should save the page as draft', async () => {
		// Find the "Save Draft" button
		await page.waitForSelector('.components-button.editor-post-save-draft');
		// Click on it
		await page.click('.components-button.editor-post-save-draft');
	});

	it('should display a success message in the snackbar', async () => {
		// Find the success message
		await page.waitForSelector(
			'.components-snackbar-list.components-editor-notices__snackbar .components-snackbar__content'
		);
		// The message should say "Draft saved"
		const message = await page.evaluate(
			() =>
				document.querySelector(
					'.components-snackbar-list.components-editor-notices__snackbar .components-snackbar__content'
				)!.textContent
		);
		expect(message).toContain('Draft saved');
	});

	afterAll(async () => {
		await browser.close();
	});
});
