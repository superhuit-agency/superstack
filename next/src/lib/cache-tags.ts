/**
 * Cache tag names, shared by the cached WordPress reads (`cacheTag`) and the
 * revalidate route (`revalidateTag`), so the two can't drift apart.
 *
 * Kept free of `next/*` imports: block data modules are also bundled into the
 * WordPress block editor.
 */
export const cacheTags = {
	/** A single post, page… by its WordPress database ID. */
	node: (databaseId: number | string) => `node:${databaseId}`,
	/**
	 * Every single post, page… of one content type. Only cleared by a "Purge
	 * all" of that type: editing one post clears its `node:` tag alone.
	 */
	nodesOfType: (contentType: string) => `nodes:${contentType}`,
	/** Listings, archives, feeds of one content type (e.g. `post`). */
	type: (contentType: string) => `type:${contentType}`,
	/** Listings with no type filter. Cleared by every post change. */
	content: () => 'content',
	/** A term, by its database ID (so a slug rename needs no old slug). */
	term: (databaseId: number | string) => `term:${databaseId}`,
	/** Term listings of one taxonomy. */
	taxonomy: (taxonomy: string) => `taxonomy:${taxonomy}`,
	/** A navigation menu, by its ID. */
	menu: (id: number | string) => `menu:${id}`,
	/** Site settings: title, tagline, date format, SEO defaults, languages. */
	settings: () => 'settings',
	/** FSE templates and template parts. */
	templates: () => 'templates',
	/**
	 * The redirect lookup for one URI, including a "no redirect" result.
	 * Next drops a tag over 256 characters: a longer one ends in a digest.
	 */
	redirect: (uri: string) => maxLength(`redirect:${normalizeUri(uri)}`),
	/**
	 * Reads that depend on which post is at which URI: cached 404s,
	 * Page-dependent blocks that found no post, and on a multilingual site
	 * every public node read, since it links to its translations.
	 */
	uris: () => 'uris',
	/** Every redirect lookup, so every cached 404 and cached redirect. */
	redirects: () => 'redirects',
	/** Every cached read. Only cleared by a manual "Purge all". */
	nodes: () => 'nodes',
};

/**
 * Tags of a read of the node at a URI (e.g. the Base URI): the node it found,
 * or `uris` when it found none, since a post may later move to that URI.
 *
 * @param databaseId The database ID of the node found, if any
 */
export const nodeAtUriTags = (databaseId: unknown): string[] =>
	typeof databaseId === 'number'
		? [cacheTags.node(databaseId)]
		: [cacheTags.uris()];

/**
 * `term:` tags of the terms an entry displays.
 *
 * @param terms Terms carrying their `databaseId`
 */
export const termTags = (
	terms: Array<{ databaseId?: unknown } | null> | null | undefined
): string[] =>
	(terms ?? [])
		.map((term) => term?.databaseId)
		.filter((id): id is number => typeof id === 'number')
		.map(cacheTags.term);

/**
 * `node:` tags of a post's ancestors, whose titles and URIs its breadcrumbs
 * display: renaming a parent page sends a change for the parent only.
 *
 * @param ancestors Ancestors carrying their `databaseId`
 */
export const ancestorTags = (
	ancestors: Array<{ databaseId?: unknown } | null> | null | undefined
): string[] =>
	(ancestors ?? [])
		.map((ancestor) => ancestor?.databaseId)
		.filter((id): id is number => typeof id === 'number')
		.map(cacheTags.node);

const TAG_MAX_LENGTH = 256;

/**
 * A tag within Next's length limit: past it, cut and ended with a digest of
 * the whole tag, so that tags differing past the cut stay apart.
 */
const maxLength = (tag: string): string =>
	tag.length <= TAG_MAX_LENGTH
		? tag
		: `${tag.slice(0, TAG_MAX_LENGTH - 9)}#${digest(tag)}`;

/** A stable digest of a string, in 8 hex digits (32-bit FNV-1a). */
const digest = (value: string): string => {
	let hash = 0x811c9dc5;

	for (let i = 0; i < value.length; i++) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}

	return (hash >>> 0).toString(16).padStart(8, '0');
};

/**
 * Normalise a URI so the redirect lookup and an incoming `redirect` change
 * agree on the tag: path only (no query or hash), decoded, lowercased, with a
 * leading and a trailing slash.
 *
 * Lowercased because Redirection can match a source case-insensitively.
 */
export function normalizeUri(uri: string): string {
	let path = uri.split(/[?#]/)[0].trim();

	try {
		path = decodeURI(path);
	} catch {
		// Malformed escape sequence: keep the path as it came
	}

	path = path.toLowerCase().replace(/\/{2,}/g, '/');

	if (!path.startsWith('/')) path = `/${path}`;
	if (!path.endsWith('/')) path = `${path}/`;

	return path;
}
