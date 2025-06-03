/**
 * Override the default "jsdom" environment to use node for Puppeteer
 * @jest-environment node
 */

import { Browser } from 'puppeteer';
import { Page } from 'puppeteer';
import { Stories as AllTestableComponents } from '@/components/stories';

const puppeteer = require('puppeteer');

const WORDPRESS_ADMIN_USER = 'superstack';
const WORDPRESS_ADMIN_PASSWORD = 'stacksuper';

describe('Admin: Create a page to test all the blocks', () => {
	let browser: Browser;
	let page: Page;
	const test_id = 'test-' + Math.random().toString(36).substring(2, 10);
	let allComponentsHTML = '';

	const setCodeEditor = async (activate: boolean) => {
		// Code Editor is on if we can find the editor toolbar ("exit code editor")
		let isOn = await page.evaluate(
			() =>
				document.querySelector('.edit-post-text-editor__toolbar') !=
				null
		);
		if ((activate && !isOn) || (!activate && isOn)) {
			await page.keyboard.down('Meta');
			await page.keyboard.down('Shift');
			await page.keyboard.down('Alt');
			await page.keyboard.press('M');
			await page.keyboard.up('Alt');
			await page.keyboard.up('Shift');
			await page.keyboard.up('Meta');
		}
	};
	const writeBlockHTML = async (blockSlug: string, blockArgs: any) => {
		let content = (blockArgs as any).content ?? null;
		let children = (blockArgs as any).children ?? null;
		let args = { ...blockArgs, children: undefined, content: undefined };
		let html = '';

		if (content) {
			html += `<!-- wp:${blockSlug} ${JSON.stringify(args)} -->\n`;
			html += content;
			html += `\n<!-- /wp:${blockSlug} -->\n`;
		} else if (children && Array.isArray(children) && children.length > 0) {
			html += `<!-- wp:${blockSlug} ${JSON.stringify(args)} -->\n`;
			for (const child of children) {
				await writeBlockHTML(child.blockName, child.attributes);
			}
			html += `\n<!-- /wp:${blockSlug} -->\n`;
			// } else if (children && children instanceof HTMLElement) {
			// 	allComponentsHTML += `<!-- wp:${blockSlug} ${JSON.stringify(args)} -->\n`;
			// 	allComponentsHTML += children.outerHTML;
			// 	allComponentsHTML += `\n<!-- /wp:${blockSlug} -->\n`;
		} else {
			html += `<!-- wp:${blockSlug} ${JSON.stringify(args)} /-->\n`;
		}
		return html;
	};

	beforeAll(async () => {
		browser = await puppeteer.launch({
			headless: false,
		});
		page = await browser.newPage();

		// Set a reasonable viewport size
		await page.setViewport({ width: 960, height: 800 });
	});

	it('should open the admin and login', async () => {
		// Go to the admin page
		await page.goto('http://localhost/wp-admin/');
		// Find out if we need to login (url changed to wp-login.php)
		const url = await page.url();
		if (url.includes('wp-login.php')) {
			await new Promise((resolve) => setTimeout(resolve, 250));
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

	it('should activate the HTML editor', async () => {
		await setCodeEditor(true);
	});

	it('should add the HTML to the page', async () => {
		// Find the main HTML TextArea
		await page.waitForSelector('textarea.editor-post-text-editor');
		let k = 99;
		for (const blockStory of AllTestableComponents) {
			let blockTitle = blockStory.blockConfig.title ?? '';
			let blockSlug = blockStory.blockConfig.slug ?? '';
			let blockClassName = blockSlug.replace('core/', '');

			for (const testableStory of blockStory.getUnitTests() as TestableStory<any>[]) {
				await page.type(
					'textarea.editor-post-text-editor',
					await writeBlockHTML(blockClassName, testableStory.args),
					{
						delay: 1,
					}
				);
			}
		}
		// Change the HTML in the textarea
		// await page.evaluate(() => {
		// 	const textarea = document.querySelector(
		// 		'textarea.editor-post-text-editor'
		// 	);
		// 	if (textarea) {
		// 		(textarea as HTMLTextAreaElement).value = allComponentsHTML;
		// 	}
		// });
		await new Promise((resolve) => setTimeout(resolve, 1000));
	});

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

	it('should switch back to the visual editor', async () => {
		// Type Meta+Shift+Alt+M to deactivate the Code Editor.
		await page.keyboard.down('Meta');
		await page.keyboard.down('Shift');
		await page.keyboard.down('Alt');
		await page.keyboard.press('M');
		await page.keyboard.up('Alt');
		await page.keyboard.up('Shift');
		await page.keyboard.up('Meta');
	});

	it('should open the Settings panel', async () => {
		// If the settings panel is still closed, open it
		if (
			await page.evaluate(
				() => document.querySelector('div#edit-post\\:document') == null
			)
		) {
			// Find the "Settings" button
			await page.waitForSelector(
				'button[aria-label="Settings"][aria-controls="edit-post:document"]'
			);
			// Click on it
			await page.click(
				'button[aria-label="Settings"][aria-controls="edit-post:document"]'
			);
		}
	});

	it('should define a slug for the page', async () => {
		// Find the "Slug" input
		await page.waitForSelector(
			'.components-button.editor-post-url__panel-toggle'
		);
		// Click on it
		await page.click('.components-button.editor-post-url__panel-toggle');

		// Find the "Slug" input
		await page.waitForSelector(
			'.components-popover__content input[type="text"]'
		);
		// Clear the field and type the slug (the slug is the page name)
		await page.evaluate(() => {
			const input = document.querySelector(
				'.components-popover__content input[type="text"]'
			);
			if (input) {
				(input as HTMLInputElement).value = '';
			}
		});
		await new Promise((resolve) => setTimeout(resolve, 50));
		await page.type(
			'.components-popover__content input[type="text"]',
			test_id
		);
	});

	it('should save the page as published', async () => {
		// Find the "Publish" button
		await page.waitForSelector(
			'.components-button.editor-post-publish-button__button'
		);
		// Click on it
		await page.click(
			'.components-button.editor-post-publish-button__button'
		);
		await new Promise((resolve) => setTimeout(resolve, 250));
		// Twice !
		await page.click(
			'.components-button.editor-post-publish-button.editor-post-publish-button__button'
		);
		await new Promise((resolve) => setTimeout(resolve, 250));
	});

	it('should see the success message in the snackbar', async () => {
		// Find the success message
		// <div class="components-snackbar" tabindex="0" role="button" aria-label="Dismiss this notice"><div class="components-snackbar__content">Page updated.<a href="/347-2/" class="components-button components-snackbar__action is-tertiary">View Page</a></div></div>
		await page.waitForSelector('.components-snackbar');
	});

	it('should visit the page and be a HTTP 200', async () => {
		// Go to the page
		const response = await page.goto(`http://localhost:3000/${test_id}/`);
		// Wait for the page to load
		await page.waitForNavigation();
		// Check the response status
		expect(response?.status()).toBe(200);
		// Give a second to any human eye looking at this test execution.
		await new Promise((resolve) => setTimeout(resolve, 1000));
	});

	afterAll(async () => {
		await browser.close();
	});
});
