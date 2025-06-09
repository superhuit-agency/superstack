import { Page } from 'puppeteer';

export const isOptionsPanelOpen = async (page: Page) => {
	return await page.evaluate(
		() =>
			document.querySelector('.interface-more-menu-dropdown__content') !=
			null
	);
};

export const setOptionsPanel = async (page: Page, activate: boolean) => {
	if ((await isOptionsPanelOpen(page)) === activate) {
		return;
	}
	await page.click(
		'.interface-more-menu-dropdown .components-button.components-dropdown-menu__toggle'
	);
};

/**
 * Activates or deactivates the Gutenberg Code Editor
 * @param page
 * @param activate
 */
export const setCodeEditor = async (page: Page, activate: boolean) => {
	// 250ms timeout
	await new Promise((resolve) => setTimeout(resolve, 250));
	// Code Editor is on if we can find the editor toolbar ("exit code editor")
	let isOn = await page.evaluate(
		() => document.querySelector('.edit-post-text-editor__toolbar') != null
	);
	if (isOn && !activate) {
		// click on the editor toolbar
		await page.click('.edit-post-text-editor__toolbar', { delay: 100 });
	} else if (!isOn && activate) {
		await setOptionsPanel(page, true);
		// Find the option command that says "Code Editor" using XPATH
		// Unfortunately, Cmd+Alt+Shift+M is not working
		await page.evaluate(() => {
			let label = document
				.querySelectorAll(
					'.interface-more-menu-dropdown__content button>span.components-menu-item__item'
				)
				.values()
				.find(
					(item) => (item as HTMLElement).innerText == 'Code editor'
				);
			if (label) {
				// click on the parent button
				label.parentElement?.click();
			}
		});
	}
};

export const isRightPanelOpen = async (page: Page) => {
	return await page.evaluate(
		() => document.querySelector('div#edit-post\\:document') != null
	);
};
export const setRightPanel = async (page: Page, activate: boolean) => {
	if ((await isRightPanelOpen(page)) === activate) {
		return;
	}
	await page.click(
		'button[aria-label="Settings"][aria-controls="edit-post:document"]'
	);
};

/**
 * Builds the HTML <--wp:--> of a Worpress block from its arguments
 * TODO: Handle children and content
 * @returns HTML to write in Gutenberg Code Editor
 */
export const writeBlockHTML = (blockSlug: string, blockArgs: any) => {
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
			html += writeBlockHTML(child.blockName, child.attributes);
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
