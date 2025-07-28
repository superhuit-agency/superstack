/**
 * Override the default "jsdom" environment to use node for Puppeteer
 * @jest-environment node
 */

import { Browser } from 'puppeteer';
import { Page } from 'puppeteer';
import { Stories as AllTestableComponents } from '@/components/stories';
import { VideoRecorder } from '../utils/video-recorder';
import {
	doLoginIfNeeded,
	setCodeEditor,
	setRightPanel,
	writeBlockHTML,
} from '../utils/admin-manipulation';
import * as AllComponentsTests from '@/components/test';

const puppeteer = require('puppeteer');

const WORDPRESS_ADMIN_USER = process.env.WORDPRESS_ADMIN_USER || 'superstack';
const WORDPRESS_ADMIN_PASSWORD =
	process.env.WORDPRESS_ADMIN_PASSWORD || 'stacksuper';
const WORDPRESS_URL = process.env.WORDPRESS_URL || 'http://localhost';
const NEXT_URL = process.env.NEXT_URL || 'http://localhost:3000';

describe('Admin: Create a new post to test all the blocks', () => {
	let browser: Browser;
	let page: Page;
	let videoRecorder: VideoRecorder;
	const test_id = 'test-' + Math.random().toString(36).substring(2, 10);

	beforeAll(async () => {
		browser = await puppeteer.launch({
			headless: process.env.CI ? 'new' : false,
			args: process.env.CI
				? [
						'--no-sandbox',
						'--disable-setuid-sandbox',
						'--disable-dev-shm-usage',
						'--disable-accelerated-2d-canvas',
						'--no-first-run',
						'--no-zygote',
						'--single-process',
						'--disable-gpu',
						'--disable-background-timer-throttling',
						'--disable-backgrounding-occluded-windows',
						'--disable-renderer-backgrounding',
						'--disable-features=TranslateUI',
						'--disable-extensions',
						'--disable-default-apps',
						'--disable-component-extensions-with-background-pages',
						'--no-default-browser-check',
						'--mute-audio',
						'--disable-web-security',
						'--allow-running-insecure-content',
						'--disable-features=VizDisplayCompositor',
					]
				: [],
			executablePath: process.env.CI
				? '/usr/bin/google-chrome'
				: undefined,
		});
		page = await browser.newPage();

		// Set a reasonable viewport size
		await page.setViewport({ width: 960, height: 800 });

		// Initialize video recorder for the entire suite
		videoRecorder = new VideoRecorder('admin_full_page_cycle', page);
		await videoRecorder.start();
	});

	beforeEach(async () => {
		// No per-test setup needed anymore
	});

	it('should open the admin and login', async () => {
		// Go to the admin page
		await page.goto(`${WORDPRESS_URL}/wp-admin/`);
		await doLoginIfNeeded(
			page,
			WORDPRESS_ADMIN_USER,
			WORDPRESS_ADMIN_PASSWORD
		);
	});

	it('should open the admin to create a new page', async () => {
		// Go to the admin page to create a new page
		await page.goto(
			`${WORDPRESS_URL}/wp-admin/post-new.php?post_type=post`
		);
	});

	it('should activate the HTML editor', async () => {
		await setCodeEditor(page, true);
	});

	it('should type a page title', async () => {
		await page.type(
			'.wp-block-post-title .components-textarea-control__input',
			`Test Post ${test_id}`,
			{ delay: 100 }
		);
	});

	it('should add the HTML to the post', async () => {
		// Find the main HTML TextArea
		let allComponentsHTML = '';
		await page.waitForSelector('textarea.editor-post-text-editor', {
			timeout: 5000,
		});
		for (const componentTests of Object.values(AllComponentsTests)) {
			let blockClassName = componentTests.block.slug ?? '';

			Object.values(componentTests.tests).forEach((testableStory) => {
				allComponentsHTML += writeBlockHTML(
					blockClassName,
					testableStory.args
				);
			});
		}
		// Change the HTML in the textarea
		await page.evaluate((html) => {
			const textarea = document.querySelector(
				'textarea.editor-post-text-editor'
			);
			if (textarea) {
				(textarea as HTMLTextAreaElement).innerHTML = html;
			}
		}, allComponentsHTML);
		await new Promise((resolve) => setTimeout(resolve, 500));
		await page.focus('textarea.editor-post-text-editor');
		await page.keyboard.press('Enter');
	});

	it('should save the post as draft', async () => {
		// Find the "Save Draft" button
		await page.waitForSelector(
			'.components-button.editor-post-save-draft',
			{ timeout: 5000 }
		);
		// Click on it
		await page.click('.components-button.editor-post-save-draft');
	});

	it('should display a success message in the snackbar', async () => {
		// Find the success message
		await page.waitForSelector(
			'.components-snackbar-list.components-editor-notices__snackbar .components-snackbar__content',
			{ timeout: 10000 }
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
		await setCodeEditor(page, false);
	});

	it('should open the Settings panel', async () => {
		// If the settings panel is still closed, open it
		await setRightPanel(page, true);
	});

	it('should define a slug for the post', async () => {
		// Find the "Slug" input
		await page.waitForSelector(
			'.components-button.editor-post-url__panel-toggle',
			{ timeout: 5000 }
		);
		// Click on it
		await page.click('.components-button.editor-post-url__panel-toggle');

		// Find the "Slug" input
		await page.waitForSelector(
			'.components-popover__content input[type="text"]',
			{ timeout: 5000 }
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

	it('should save the post as published', async () => {
		// Find the "Publish" button
		await page.waitForSelector(
			'.components-button.editor-post-publish-button__button',
			{ timeout: 5000 }
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
		await page.waitForSelector('.components-snackbar', { timeout: 10000 });
	});

	it('should visit the post and be a HTTP 200', async () => {
		// Go to the post
		const response = await page.goto(`${NEXT_URL}/${test_id}/`);
		// Wait for the page to load
		await page.waitForNavigation({ timeout: 10000 });
		// Check the response status
		expect(response?.status()).toBe(200);
		// Give a second to any human eye looking at this test execution.
		await new Promise((resolve) => setTimeout(resolve, 1000));
	});

	afterAll(async () => {
		// Stop video recording
		const videoFile = await videoRecorder?.stop();
		if (videoFile) {
			console.log(
				`📹 Complete test suite video saved: ${videoFile.filePath} (${videoFile.fileSize} bytes)`
			);
		}

		await browser.close();
	});

	afterEach(async () => {
		// No per-test cleanup needed anymore
	});
});
