import { cacheLife, cacheTag } from 'next/cache';

import { blocksDataList } from '@/components/global/blockRegistry';
import { baseUriContext, guardBaseUri } from '@/hooks/use-base-uri';
import { cacheTags } from '@/lib/cache-tags';
import fetchAPI from '@/lib/fetch-api';

export type BlockData = Record<string, unknown> & { cacheTags?: string[] };

export type BlockDataModule = {
	getData?: (
		fetcher: FetchApiFuncType,
		attrs: object,
		lang?: string | null
	) => Promise<BlockData | undefined>;
	/** Set by Page-dependent blocks: their data changes with the Base URI. */
	usesBaseUri?: boolean;
};

export const getBlockDataModule = async (
	name: string
): Promise<BlockDataModule | null> =>
	((await blocksDataList[name as keyof typeof blocksDataList]?.()) as
		| BlockDataModule
		| undefined) ?? null;

/**
 * A block's data, cached until one of its tags is revalidated.
 *
 * The block is identified by its registry name, so every argument is plain
 * data and makes up the cache key. `baseUri` is passed for blocks declaring
 * `usesBaseUri` only: the others get one entry per site, and reading the
 * Base URI throws for them.
 *
 * Block data modules can't do this themselves: they're also bundled into
 * the WordPress block editor, which has no `next/cache`.
 *
 * @param name       The block's registry name, e.g. `core/post-title`
 * @param attributes The block's attributes
 * @param lang       The language code
 * @param baseUri    The Base URI, for blocks declaring `usesBaseUri` only
 */
export default async function getCachedBlockData(
	name: string,
	attributes: object,
	lang: string | null,
	baseUri: string | null
): Promise<Record<string, unknown>> {
	'use cache';
	cacheLife('max');
	cacheTag(cacheTags.nodes());

	const blockModule = await getBlockDataModule(name);

	// The request-scoped Base URI doesn't cross into a cached scope
	if (!blockModule?.usesBaseUri) guardBaseUri(name);
	else if (baseUri) baseUriContext(baseUri);

	const { cacheTags: tags, ...data } =
		(await blockModule?.getData?.(fetchAPI, attributes, lang)) ?? {};

	if (tags?.length) {
		cacheTag(...tags);
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
