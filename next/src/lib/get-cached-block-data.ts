import { cacheLife, cacheTag } from 'next/cache';

import { blocksDataList } from '@/components/global/blockRegistry';
import { baseUriContext, guardBaseUri } from '@/hooks/use-base-uri';
import { cacheTags } from '@/lib/cache-tags';
import fetchAPI from '@/lib/fetch-api';

const CACHE_TAG_MAX_ITEMS = 128;

export type BlockData = Record<string, unknown> & { cacheTags?: string[] };

export type BlockDataModule = {
	getData?: (
		fetcher: FetchApiFuncType,
		attrs: object,
		lang?: string | null,
		context?: BlockDataContext
	) => Promise<BlockData | undefined>;
	/**
	 * Set by Page-dependent blocks, whose data changes with the Base URI, or
	 * by the attributes they do for.
	 */
	usesBaseUri?: boolean | ((attrs: object) => boolean);
	/**
	 * Set by blocks whose data changes with the archive being viewed, or by
	 * the attributes they do for.
	 */
	usesArchiveContext?: boolean | ((attrs: object) => boolean);
};

export const getBlockDataModule = async (
	name: string
): Promise<BlockDataModule | null> =>
	((await blocksDataList[name as keyof typeof blocksDataList]?.()) as
		| BlockDataModule
		| undefined) ?? null;

/**
 * Whether a block's data changes with the Base URI, for these attributes
 */
export const blockUsesBaseUri = (
	blockModule: BlockDataModule | null,
	attributes: object
) =>
	typeof blockModule?.usesBaseUri === 'function'
		? blockModule.usesBaseUri(attributes)
		: !!blockModule?.usesBaseUri;

/**
 * A block's data, cached until one of its tags is revalidated.
 *
 * The block is identified by its registry name, so every argument is plain
 * data and makes up the cache key. `baseUri` is passed for blocks declaring
 * `usesBaseUri` only: the others get one entry per site, and reading the
 * Base URI throws for them. Likewise, `context` is passed for blocks
 * declaring `usesArchiveContext` only.
 *
 * Block data modules can't do this themselves: they're also bundled into
 * the WordPress block editor, which has no `next/cache`.
 *
 * @param name       The block's registry name, e.g. `core/post-title`
 * @param attributes The block's attributes
 * @param lang       The language code
 * @param baseUri    The Base URI, for blocks declaring `usesBaseUri` only
 * @param context    The archive being viewed, for blocks declaring
 *                   `usesArchiveContext` only
 */
export default async function getCachedBlockData(
	name: string,
	attributes: object,
	lang: string | null,
	baseUri: string | null,
	context?: BlockDataContext
): Promise<Record<string, unknown>> {
	'use cache';
	cacheLife('max');
	cacheTag(cacheTags.nodes());

	const blockModule = await getBlockDataModule(name);

	// The request-scoped Base URI doesn't cross into a cached scope
	if (!blockUsesBaseUri(blockModule, attributes)) guardBaseUri(name);
	else if (baseUri) baseUriContext(baseUri);

	const { cacheTags: tags, ...data } =
		(await blockModule?.getData?.(fetchAPI, attributes, lang, context)) ??
		{};

	// An empty list declares no dependency: only "Purge all" refreshes it
	if (tags) {
		// Next drops the tags past 128 in one `cacheTag()` call, not across
		// calls: a menu can link to more posts than that
		for (let i = 0; i < tags.length; i += CACHE_TAG_MAX_ITEMS) {
			cacheTag(...tags.slice(i, i + CACHE_TAG_MAX_ITEMS));
		}
	} else {
		// Covers what untagged blocks may read: posts and site settings
		cacheTag(cacheTags.content(), cacheTags.settings());

		if (process.env.NODE_ENV === 'development') {
			console.warn(
				`Block "${name}" returned no \`cacheTags\` from \`getData\`: ` +
					`its data falls back to the \`content\` and \`settings\` ` +
					`tags and is fetched again after every post or settings change.`
			);
		}
	}

	return data;
}
