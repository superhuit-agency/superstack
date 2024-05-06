declare global {
	interface Window {
		wp: any;
	}
}

import domReady from '@wordpress/dom-ready';
import { addFilter } from '@wordpress/hooks';
import {
	BlockConfiguration,
	getBlockTypes,
	registerBlockType,
	unregisterBlockType,
} from '@wordpress/blocks';

/**
 * Loads custom editor styles
 */
import '@/css/base/index.css';
import './_loader.css';

/**
 * Loads custom Post Type plugins
 */
import './blocks-whitelist';

/**
 * Import custom blocks & filters
 */
import * as blocks from '@/components/edit';
import * as filters from '@/components/filters';
import { WpBlockType, WpFilterType } from '@/typings';

// Register blocks for WP editor
for (const key in blocks) {
	if (Object.prototype.hasOwnProperty.call(blocks, key)) {
		const block = blocks[key as keyof typeof blocks] as WpBlockType<any>;

		if (!block.slug || !block.settings) continue;

		// Register block
		registerBlockType(
			block.slug,
			block.settings as BlockConfiguration<any>
		);
	}
}

// Edit core blocks filters for WP editor
for (const key in filters) {
	if (Object.prototype.hasOwnProperty.call(filters, key)) {
		const filter: WpFilterType = filters[key as keyof typeof filters];
		addFilter(filter.hook, filter.namespace, filter.callback);
	}
}

const excludedBlocks = [
	'core/archives',
	'core/audio',
	'core/avatar',
	'core/buttons',
	'core/button',
	'core/calendar',
	'core/categories',
	'core/code',
	'core/column',
	'core/columns',
	'core/comments',
	'core/cover',
	'core/details',
	'core/embed',
	'core/file',
	'core/footnotes',
	'core/freeform',
	'core/gallery',
	'core/group',
	'core/html',
	'core/image',
	'core/latest-comments',
	'core/latest-posts',
	'core/loginout',
	'core/media-text',
	// 'core/missing',
	'core/more',
	'core/navigation',
	'core/navigation-link',
	'core/nextpage',
	'core/page-list',
	'core/post-author',
	'core/post-author-biography',
	'core/post-author-name',
	'core/post-comments-form',
	'core/post-content',
	'core/post-date',
	'core/post-excerpt',
	'core/post-featured-image',
	'core/post-navigation-link',
	'core/post-terms',
	'core/post-title',
	'core/preformatted',
	'core/pullquote',
	'core/query',
	'core/query-title',
	'core/quote',
	'core/read-more',
	'core/reusable-block',
	'core/rss',
	'core/search',
	'core/separator',
	'core/shortcode',
	'core/site-logo',
	'core/site-tagline',
	'core/site-title',
	'core/social-link',
	'core/social-links',
	'core/spacer',
	'core/subhead',
	'core/table',
	'core/table-of-contents',
	'core/tag-cloud',
	'core/term-description',
	'core/text-columns',
	'core/verse',
	'core/video',
];

const excludedBlockGroups = [
	'core-embed/',
	'yoast/',
	'yoast-seo/',
	'polylang/',
];

domReady(() => {
	// Unregister some core blocks
	const blockTypes = getBlockTypes();
	blockTypes.forEach((block: any) => {
		if (!block?.name) return; // should not happen
		if (excludedBlocks.includes(block.name))
			unregisterBlockType(block.name);
		excludedBlockGroups.forEach((group) => {
			if (block.name.startsWith(group)) unregisterBlockType(block.name);
		});
	});

	// Remove format type unwanted/unneeded
	window.wp.data
		.dispatch('core/rich-text')
		.removeFormatTypes([
			'core/strikethrough',
			'core/image',
			'core/code',
			'core/text-color',
			'core/keyboard',
		]);
});
