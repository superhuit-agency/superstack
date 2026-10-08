import { revalidatePath, revalidateTag } from 'next/cache';

import { cacheTags, decodePath } from '@/lib/cache-tags';
import secretMatches from '@/lib/secret-matches';

/** The nextjs-revalidate contract version this route speaks. */
const CONTRACT_VERSION = 2;

export async function POST(request: Request) {
	// Check for secret to confirm this is a valid request
	if (!isAuthorized(request.headers)) {
		return Response.json({ message: 'Invalid request' }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ message: 'Invalid JSON body' }, { status: 400 });
	}

	// A version this route doesn't know is a breaking change: answer with a
	// 4xx so the plugin reports a failure instead of expiring the wrong tags
	if (!isObject(body) || body.version !== CONTRACT_VERSION) {
		return Response.json(
			{ message: 'Unsupported contract version' },
			{ status: 400 }
		);
	}

	if (!Array.isArray(body.changes)) {
		return Response.json({ message: 'Missing changes' }, { status: 400 });
	}

	const tags = new Set<string>();
	const expiredTags = new Set<string>();
	const paths = new Set<string>();
	for (const change of body.changes) {
		if (!isObject(change)) continue;

		const invalidation = invalidationOf(change);
		invalidation.tags?.forEach((tag) => tags.add(tag));
		invalidation.expiredTags?.forEach((tag) => expiredTags.add(tag));
		// Decoded: Next tags a page by its decoded path, WordPress sends it
		// percent-encoded
		if (invalidation.path) paths.add(decodePath(invalidation.path));
	}

	// Marked stale only: the next visitor gets the stale entry while a fresh
	// one is generated
	for (const tag of tags) {
		if (!expiredTags.has(tag)) revalidateTag(tag, 'max');
	}

	// Expired: the next visitor waits for a fresh render. A page that may turn
	// into a redirect can't be re-rendered in the background, which Next
	// caches as a 308 without its Location header (#207). Only tags no change
	// marks stale: a later `'max'` on a tag replaces its expiry
	for (const tag of expiredTags) revalidateTag(tag, { expire: 0 });

	// Expired too: the page at that path
	for (const path of paths) revalidatePath(path);

	return Response.json({ revalidated: true, now: Date.now() });
}

/**
 * What one change clears: cache tags to mark stale or to expire, or a path. A
 * subject or a field this route doesn't know is ignored, so a minor plugin
 * release never breaks the site.
 */
function invalidationOf(change: Record<string, unknown>): {
	tags?: string[];
	expiredTags?: string[];
	path?: string;
} {
	switch (change.subject) {
		case 'post':
			return postInvalidation(change);

		// Normalised by the helper, the same way as the redirect lookup's tag.
		// The page at the source path too: it may be a page, not a cached 404,
		// e.g. a post's old URI after Redirection's slug monitor
		case 'redirect':
			return typeof change.uri === 'string'
				? {
						expiredTags: [cacheTags.redirect(change.uri)],
						path: change.uri,
					}
				: {};

		// this should be the actual path not a rewritten path
		// e.g. for "/blog/[slug]" this should be "/blog/post-1"
		case 'path':
			return typeof change.uri === 'string' ? { path: change.uri } : {};

		// Menus are read by ID, never by location: `locations` is ignored
		case 'menu':
			return isId(change.id) ? { tags: [cacheTags.menu(change.id)] } : {};

		case 'templates':
			return { tags: [cacheTags.templates()] };

		case 'settings':
			return { tags: [cacheTags.settings()] };

		case 'all':
			return allInvalidation(change);

		default:
			return {};
	}
}

/**
 * A post's own entry, its type's listings and the untyped listings. When its
 * URI changed (a publish, an unpublish, a trash, a delete or a slug change),
 * also the cached 404s, so a URI that now has content stops answering 404,
 * and the page at its old URI, expired: that URI may now be a redirect source.
 */
function postInvalidation({
	id,
	type,
	before,
	after,
}: Record<string, unknown>) {
	if (!isId(id) || typeof type !== 'string') return {};

	const tags = [
		cacheTags.node(id),
		cacheTags.type(type),
		cacheTags.content(),
	];

	if (uriOf(before) === uriOf(after)) return { tags };

	return {
		tags: [...tags, cacheTags.uris()],
		path: uriOf(before) ?? undefined,
	};
}

/**
 * The manual "Purge all" lever. Without a `type`, everything for the whole
 * site, with the cached 404s and redirects expired since any of them may now
 * be a redirect source or redirect elsewhere; with one, that type's single
 * pages and listings, and the term listings of its taxonomies.
 */
function allInvalidation({ type, taxonomies }: Record<string, unknown>) {
	if (typeof type !== 'string') {
		return {
			tags: [
				cacheTags.nodes(),
				cacheTags.settings(),
				cacheTags.templates(),
				cacheTags.uris(),
			],
			expiredTags: [cacheTags.redirects()],
		};
	}

	return {
		tags: [
			cacheTags.nodesOfType(type),
			cacheTags.type(type),
			...(Array.isArray(taxonomies) ? taxonomies : [])
				.filter((taxonomy) => typeof taxonomy === 'string')
				.map(cacheTags.taxonomy),
		],
	};
}

/** The URI of one side of a post change, `null` when it's not on the site. */
function uriOf(side: unknown): string | null {
	return isObject(side) && typeof side.uri === 'string' ? side.uri : null;
}

/**
 * Whether the request carries the secret, compared in constant time. With no
 * secret configured, nothing is authorized.
 *
 * `X-Nextjs-Revalidate-Secret` first, holding the bare secret: the plugin
 * (2.1+) sends it there when its revalidate domain has basic-auth credentials,
 * which take `Authorization`. Otherwise `Authorization: Bearer <secret>`.
 */
function isAuthorized(headers: Headers): boolean {
	const secret = process.env.REVALIDATE_SECRET;
	if (!secret) return false;

	const own = headers.get('X-Nextjs-Revalidate-Secret');
	if (own !== null) return secretMatches(own, secret);

	const authorization = headers.get('Authorization');
	return (
		authorization !== null &&
		secretMatches(authorization, `Bearer ${secret}`)
	);
}

function isId(value: unknown): value is number {
	return Number.isInteger(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
