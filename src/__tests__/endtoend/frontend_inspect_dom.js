/**
 * Override the default "jsdom" environment to use node
 * @jest-environment node
 */

const puppeteer = require('puppeteer');
const { VideoRecorder } = require('../utils/video-recorder');

const NEXT_URL = process.env.NEXT_URL || 'http://localhost:3000';

describe('Frontend: Inspect the DOM', () => {
	let browser;
	let page;
	let videoRecorder;

	// Setup before all tests
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

		// Create a single page for the entire test suite
		page = await browser.newPage();

		// Initialize video recorder for the entire suite
		videoRecorder = new VideoRecorder('Frontend_Inspect_DOM', page);
		await videoRecorder.start();
	});

	// Cleanup after all tests
	afterAll(async () => {
		// Stop video recording BEFORE closing the browser
		const videoFile = await videoRecorder?.stop();
		if (videoFile) {
			console.log(
				`📹 Complete test suite video saved: ${videoFile.filePath} (${videoFile.fileSize} bytes)`
			);
		}

		// Close the page and browser
		if (page) {
			await page.close();
		}
		await browser.close();
	});

	it('should load the page and check content', async () => {
		// Navigate to your page
		await page.goto(`${NEXT_URL}/blog/hello-world/`);

		// Wait for specific element to be present
		await page.waitForSelector('h1', { timeout: 5000 });

		// Get text content
		const h1Text = await page.$eval('h1', (el) => el.textContent);
		expect(h1Text).toBe('Hello world!');

		// Find the footer
		const footer = await page.$eval(
			'footer.supt-footer',
			(el) => el.textContent
		);
		expect(footer).toBeDefined();
	});
});
