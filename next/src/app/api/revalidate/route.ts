import { timingSafeEqual } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';

import { cacheTags } from '@/lib/cache-tags';

/** The nextjs-revalidate contract version this route speaks. */
const CONTRACT_VERSION = 2;

export async function POST(request: Request) {
	// Check for secret to confirm this is a valid request
	if (!isAuthorized(request.headers.get('Authorization'))) {
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
	const paths = new Set<string>();
	for (const change of body.changes) {
		if (!isObject(change)) continue;

		const invalidation = invalidationOf(change);
		invalidation.tags?.forEach((tag) => tags.add(tag));
		if (invalidation.path) paths.add(invalidation.path);
	}

	// Marked stale only: the next visitor gets the stale entry while a fresh
	// one is generated
	for (const tag of tags) revalidateTag(tag, 'max');

	for (const path of paths) revalidatePath(path);

	return Response.json({ revalidated: true, now: Date.now() });
}

/**
 * What one change clears: cache tags, or a path. A subject or a field this
 * route doesn't know is ignored, so a minor plugin release never breaks the
 * site.
 */
function invalidationOf(change: Record<string, unknown>): {
	tags?: string[];
	path?: string;
} {
	switch (change.subject) {
		case 'post':
			return { tags: postTags(change) };

		// Normalised by the helper, the same way as the redirect lookup's tag
		case 'redirect':
			return typeof change.uri === 'string'
				? { tags: [cacheTags.redirect(change.uri)] }
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
			return { tags: allTags(change) };

		default:
			return {};
	}
}

/**
 * A post's own entry, its type's listings and the untyped listings. When its
 * URI changed (a publish, an unpublish, a trash, a delete or a slug change),
 * also the cached 404s, so a URI that now has content stops answering 404.
 */
function postTags({ id, type, before, after }: Record<string, unknown>) {
	if (!isId(id) || typeof type !== 'string') return [];

	const tags = [
		cacheTags.node(id),
		cacheTags.type(type),
		cacheTags.content(),
	];

	if (uriOf(before) !== uriOf(after)) tags.push(cacheTags.uris());

	return tags;
}

/**
 * Everything for the whole site: the manual "Purge all" lever. Scoped to one
 * post type, its listings and the term listings of its taxonomies.
 */
function allTags({ type, taxonomies }: Record<string, unknown>) {
	if (typeof type !== 'string') {
		return [
			cacheTags.nodes(),
			cacheTags.settings(),
			cacheTags.templates(),
			cacheTags.uris(),
		];
	}

	return [
		cacheTags.type(type),
		...(Array.isArray(taxonomies) ? taxonomies : [])
			.filter((taxonomy) => typeof taxonomy === 'string')
			.map(cacheTags.taxonomy),
	];
}

/** The URI of one side of a post change, `null` when it's not on the site. */
function uriOf(side: unknown): string | null {
	return isObject(side) && typeof side.uri === 'string' ? side.uri : null;
}

/**
 * Whether the `Authorization` header carries the secret, compared in constant
 * time. With no secret configured, nothing is authorized.
 */
function isAuthorized(header: string | null): boolean {
	const secret = process.env.REVALIDATE_SECRET;
	if (!secret || header === null) return false;

	const given = Buffer.from(header);
	const expected = Buffer.from(`Bearer ${secret}`);

	return given.length === expected.length && timingSafeEqual(given, expected);
}

function isId(value: unknown): value is number {
	return Number.isInteger(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
