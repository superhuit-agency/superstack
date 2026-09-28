/**
 * Injects a Yoast breadcrumbs trail into the `yoast-seo/breadcrumbs` block's
 * attributes.
 *
 * The breadcrumbs block is dynamic (server-rendered by Yoast at request time)
 * so its trail is never part of `blocksJSON`. We wire the data in here instead,
 * where the SEO payload is already in hand — no extra fetch.
 *
 * @param blocks - The template + content blocks tree
 * @param breadcrumbs - The `{ text, url }` trail, from the node's
 *                      `seo.breadcrumbs` or built for a nodeless route (404)
 * @returns
 */
const injectBreadcrumbs = (
	blocks: Array<BlockPropsType | null>,
	breadcrumbs: Array<{ text: string; url: string }>
): Array<BlockPropsType | null> =>
	blocks.map((block) => {
		if (!block) return block;

		if (block.name === 'yoast-seo/breadcrumbs') {
			return {
				...block,
				attributes: {
					...block.attributes,
					breadcrumbs,
				},
			};
		}

		return {
			...block,
			innerBlocks: injectBreadcrumbs(block.innerBlocks ?? [], breadcrumbs),
		};
	});

export default injectBreadcrumbs;
