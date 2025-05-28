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
			headless: 'new', // Use new headless mode
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
