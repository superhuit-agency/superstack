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
	/** The redirect lookup for one URI, including a "no redirect" result. */
	redirect: (uri: string) => `redirect:${normalizeUri(uri)}`,
	/** Public node reads that found no node (cached 404s). */
	uris: () => 'uris',
	/** Every cached read. Only cleared by a manual "Purge all". */
	nodes: () => 'nodes',
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
