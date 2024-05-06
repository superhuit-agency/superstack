import { useMemo } from '@wordpress/element';

declare global {
	interface Window {
		pll_block_editor_plugin_settings: any;
	}
}

/**
 * Retrieve the current locale in WordPress editor
 */
export const useLocale = (dflt = 'fr') =>
	useMemo(
		() => window?.pll_block_editor_plugin_settings?.lang?.slug ?? dflt,
		[dflt]
	);
