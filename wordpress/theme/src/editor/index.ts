/* JavaScript for the block editor */
import { addFilter } from '@wordpress/hooks';
import domReady from '@wordpress/dom-ready';
import {
	getBlockTypes,
	unregisterBlockType,
	getBlockVariations,
	unregisterBlockVariation,
} from '@wordpress/blocks';

/**
 * Import custom blocks
 */
import '../blocks';

import './pattern-slash-inserter';

import './index.css';

/**
 * Excluded blocks from the editor.
 */

const excludedBlocks = [
  "core/archives",
  "core/calendar",
  "core/comments",
  "core/details",
  "core/loginout",
  "core/more",
  "core/nextpage",
  "core/page-list",
  "core/post-author-biography",
  "core/post-comment",
  "core/post-comments-count",
  "core/post-comments-form",
  "core/post-comments-link",
  "core/read-more",
  "core/rss",
  "core/search",
  "core/shortcode",
  "core/tag-cloud",
];
const excludedBlockGroups = ['yoast/', 'yoast-seo/', 'polylang/'];
const allowedEmbedVariants = ['youtube', 'vimeo'];

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

	// Unregister embed variants that are not allowed
	getBlockVariations('core/embed').forEach((variant: any) => {
		if (!allowedEmbedVariants.includes(variant.name)) {
			unregisterBlockVariation('core/embed', variant.name);
		}
	});
});
