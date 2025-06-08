/**
 * Override the default "jsdom" environment to use node
 * @jest-environment node
 */

const puppeteer = require('puppeteer');

describe('Frontend: Inspect the DOM', () => {
	let browser;
	let page;

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
	});

	// Setup before each test
	beforeEach(async () => {
		page = await browser.newPage();
	});

	// Cleanup after each test
	afterEach(async () => {
		await page.close();
	});

	// Cleanup after all tests
	afterAll(async () => {
		await browser.close();
	});

	it('should load the page and check content', async () => {
		// Navigate to your page
		await page.goto('http://localhost:3000/blog/hello-world/');

		// Wait for specific element to be present
		await page.waitForSelector('h1');

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
