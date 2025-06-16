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
} from '../utils/admin-manipulation';

const puppeteer = require('puppeteer');

const WORDPRESS_ADMIN_USER = process.env.WORDPRESS_ADMIN_USER || 'superstack';
const WORDPRESS_ADMIN_PASSWORD =
	process.env.WORDPRESS_ADMIN_PASSWORD || 'stacksuper';
const WORDPRESS_URL = process.env.WORDPRESS_URL || 'http://localhost';

describe('Admin: Create a page to test all the blocks', () => {
	let browser: Browser;
	let page: Page;
	let videoRecorder: VideoRecorder;
	const test_id = 'test-' + Math.random().toString(36).substring(2, 10);
	let allComponentsHTML = '';

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
		videoRecorder = new VideoRecorder('admin_create_empty_components');
		await videoRecorder.startRecording(page);
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
			`${WORDPRESS_URL}/wp-admin/post-new.php?post_type=page`
		);
	});

	it('should deactivate the Code Editor', async () => {
		// Code Editor is on if we can find the editor toolbar ("exit code editor")
		await new Promise((resolve) => setTimeout(resolve, 500));
		await setCodeEditor(page, false);
	});

	for (const blockStory of AllTestableComponents) {
		let blockTitle = blockStory.blockConfig.title ?? '';
		let blockSlug = blockStory.blockConfig.slug ?? '';
		let blockClassName = blockSlug.replace('core/', '').replace(/\//g, '-');

		it('should add the ' + blockTitle + ' block to the page', async () => {
			// Find the "+" button on the top left of the page
			await page.waitForSelector(
				'button.components-button.editor-document-tools__inserter-toggle',
				{ timeout: 5000 }
			);
			// Click on the "+" button
			await page.click(
				'button.components-button.editor-document-tools__inserter-toggle',
				{
					delay: 100,
				}
			);
			// Find the "Search input" in the inserter
			await page.waitForSelector('input.components-input-control__input');
			// Type the block name in the search input
			await page.type(
				'input.components-input-control__input',
				blockTitle
			);
			// Wait and find the first component in the list
			await page
				.waitForSelector(
					'.block-editor-block-types-list button.editor-block-list-item-' +
						blockClassName,
					{
						timeout: 500,
					}
				)
				.then(async (block) => {
					// Click on it
					await page.click(
						'.block-editor-block-types-list button.editor-block-list-item-' +
							blockClassName,
						{
							delay: 100,
						}
					);
				})
				.catch((err) => {
					console.log(
						`Block ${blockTitle} (${blockSlug}) could not be added to the page`
					);
				});
			// Close the Blocks inserter panel
			await page.click(
				'.components-button.editor-document-tools__inserter-toggle.is-pressed'
			);
		});
	}

	it('should save the page as draft', async () => {
		await setRightPanel(page, true);
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
			{ timeout: 1000 }
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
		// Stop video recording
		if (videoRecorder) {
			const videoPath = await videoRecorder.stopRecording();
			if (videoPath) {
				console.log(`Video log saved: ${videoPath}`);
			}
			videoRecorder.cleanup();
		}

		await browser.close();
	});

	afterEach(async () => {
		// No per-test cleanup needed anymore
	});
});
