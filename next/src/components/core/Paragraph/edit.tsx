import domReady from '@wordpress/dom-ready';
import { unregisterFormatType } from '@wordpress/rich-text';

// internal imports
import block from './block.json';

// styles
import './styles.css';
/**
 * Add custom `postTypes` to core/paragraph block
 */
const withCustomPostTypesSetting = (
	settings: WpBlockType<any>['settings'],
	name: string
) => {
	if (name !== block.slug) {
		return settings;
	}

	settings['postTypes'] = ['post'];

	return settings;
};
export const ParagraphEditBlockSettings: WpFilterType = {
	hook: 'blocks.registerBlockType',
	namespace: 'supt/paragraph-edit-setting',
	callback: withCustomPostTypesSetting,
};

/**
 * Disable unwanted text formats
 *
 * @see https://developer.wordpress.org/block-editor/how-to-guides/format-api/
 * @see https://github.com/WordPress/gutenberg/tree/trunk/packages/format-library/src
 */
domReady(() => {
	unregisterFormatType('core/text-color'); // Highlight text
	unregisterFormatType('core/image'); // Inline image
	unregisterFormatType('core/keyboard');
	unregisterFormatType('core/code');
});

export const ParagraphBlock = {
	slug: block.slug,
};
