import { revalidatePath, revalidateTag } from 'next/cache';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as route from '@/app/api/revalidate/route';

vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
	revalidateTag: vi.fn(),
}));

const SECRET = 'test-secret';

function request(
	body: unknown,
	{
		authorization = `Bearer ${SECRET}`,
		secret = null,
	}: { authorization?: string | null; secret?: string | null } = {}
) {
	const headers = new Headers({ 'Content-Type': 'application/json' });
	if (authorization !== null) headers.set('Authorization', authorization);
	if (secret !== null) headers.set('X-Nextjs-Revalidate-Secret', secret);

	return new Request('http://localhost:3000/api/revalidate', {
		method: 'POST',
		headers,
		body: typeof body === 'string' ? body : JSON.stringify(body),
	});
}

function body(changes: unknown[]) {
	return { version: 2, changes };
}

function send(changes: unknown[]) {
	return route.POST(request(body(changes)));
}

const STALE = 'max';
const EXPIRED = { expire: 0 };

/**
 * The tags cleared with `profile`, sorted: the order they're cleared in
 * doesn't matter.
 */
function tagsClearedWith(profile: typeof STALE | typeof EXPIRED) {
	return vi
		.mocked(revalidateTag)
		.mock.calls.filter(
			([, given]) => JSON.stringify(given) === JSON.stringify(profile)
		)
		.map(([tag]) => tag)
		.sort();
}

/** The tags marked stale: the next visitor still gets the cached entry. */
function tagsMarkedStale() {
	return tagsClearedWith(STALE);
}

/** The tags expired: the next visitor waits for a fresh render. */
function tagsExpired() {
	return tagsClearedWith(EXPIRED);
}

/** The paths revalidated, which expires the page at each. */
function pathsExpired() {
	return vi
		.mocked(revalidatePath)
		.mock.calls.map(([path]) => path)
		.sort();
}

beforeEach(() => {
	vi.stubEnv('REVALIDATE_SECRET', SECRET);
});

afterEach(() => {
	// Every tag is cleared once, either marked stale or expired
	const tags = vi.mocked(revalidateTag).mock.calls.map(([tag]) => tag);
	const cleared = [...tagsMarkedStale(), ...tagsExpired()];

	vi.unstubAllEnvs();
	vi.clearAllMocks();

	expect(cleared).toHaveLength(tags.length);
	expect(new Set(tags).size).toBe(tags.length);
});

describe('POST /api/revalidate', () => {
	it('clears the templates for a templates change', async () => {
		const response = await send([{ subject: 'templates' }]);

		expect(response.status).toBe(200);
		expect(tagsMarkedStale()).toEqual(['templates']);
	});

	describe('a post change', () => {
		it('clears the post, its type and the content for an edit', async () => {
			const response = await send([
				{
					subject: 'post',
					id: 42,
					type: 'post',
					before: { uri: '/hello/' },
					after: { uri: '/hello/' },
				},
			]);

			expect(response.status).toBe(200);
			expect(tagsMarkedStale()).toEqual([
				'content',
				'node:42',
				'type:post',
			]);
			expect(tagsExpired()).toEqual([]);
		});

		it.each([
			['a publish', null, { uri: '/hello/' }, []],
			[
				'an unpublish, trash or delete',
				{ uri: '/hello/' },
				null,
				['/hello/'],
			],
			[
				'a slug change',
				{ uri: '/hello/' },
				{ uri: '/hello-world/' },
				['/hello/'],
			],
		])(
			'also clears the cached 404s, and expires the old URI, for %s',
			async (_, before, after, paths) => {
				await send([
					{ subject: 'post', id: 42, type: 'event', before, after },
				]);

				expect(tagsMarkedStale()).toEqual([
					'content',
					'node:42',
					'type:event',
					'uris',
				]);
				expect(tagsExpired()).toEqual([]);
				expect(pathsExpired()).toEqual(paths);
			}
		);

		it('expires the old URI once for a slug change and the redirect it creates', async () => {
			await send([
				{
					subject: 'post',
					id: 42,
					type: 'post',
					before: { uri: '/hello/' },
					after: { uri: '/hello-world/' },
				},
				{ subject: 'redirect', uri: '/hello/' },
			]);

			expect(tagsMarkedStale()).toEqual([
				'content',
				'node:42',
				'type:post',
				'uris',
			]);
			expect(tagsExpired()).toEqual(['redirect:/hello/']);
			expect(revalidatePath).toHaveBeenCalledExactlyOnceWith('/hello/');
		});

		it('clears each tag once for several posts', async () => {
			await send([
				{
					subject: 'post',
					id: 1,
					type: 'post',
					before: null,
					after: { uri: '/a/' },
				},
				{
					subject: 'post',
					id: 2,
					type: 'post',
					before: { uri: '/b/' },
					after: null,
				},
			]);

			expect(tagsMarkedStale()).toEqual([
				'content',
				'node:1',
				'node:2',
				'type:post',
				'uris',
			]);
			expect(pathsExpired()).toEqual(['/b/']);
		});

		it("clears a moved page's descendants, which the plugin reports as changes of their own", async () => {
			await send([
				{
					subject: 'post',
					id: 12,
					type: 'page',
					before: { uri: '/about/' },
					after: { uri: '/company/' },
				},
				{
					subject: 'post',
					id: 13,
					type: 'page',
					before: { uri: '/about/team/' },
					after: { uri: '/company/team/' },
				},
			]);

			expect(tagsMarkedStale()).toEqual([
				'content',
				'node:12',
				'node:13',
				'type:page',
				'uris',
			]);
		});
	});

	describe('a redirect change', () => {
		it.each([
			['/old-path/'],
			['/old-path'],
			['old-path/'],
			['old-path'],
			['/Old-Path/'],
		])(
			'expires the redirect lookup of "%s" under its normalised URI, and the page at it',
			async (uri) => {
				await send([{ subject: 'redirect', uri }]);

				expect(tagsMarkedStale()).toEqual([]);
				expect(tagsExpired()).toEqual(['redirect:/old-path/']);
				expect(revalidatePath).toHaveBeenCalledExactlyOnceWith(uri);
			}
		);
	});

	it.each([
		['assigned to locations', ['primary', 'footer']],
		['assigned to none', []],
	])('clears the menu of a menu change %s', async (_, locations) => {
		await send([{ subject: 'menu', id: 7, locations }]);

		expect(tagsMarkedStale()).toEqual(['menu:7']);
	});

	it('clears the settings for a settings change', async () => {
		await send([{ subject: 'settings' }]);

		expect(tagsMarkedStale()).toEqual(['settings']);
	});

	describe('an all change', () => {
		it('clears everything for the whole site, and expires the cached 404s and redirects', async () => {
			await send([{ subject: 'all' }]);

			expect(tagsMarkedStale()).toEqual([
				'nodes',
				'settings',
				'templates',
				'uris',
			]);
			expect(tagsExpired()).toEqual(['redirects']);
		});

		it('clears the single pages, the type and its taxonomies for one post type', async () => {
			await send([
				{
					subject: 'all',
					type: 'post',
					taxonomies: ['category', 'post_tag'],
				},
			]);

			expect(tagsMarkedStale()).toEqual([
				'nodes:post',
				'taxonomy:category',
				'taxonomy:post_tag',
				'type:post',
			]);
		});

		it('clears the single pages and the type for one post type with no taxonomies', async () => {
			await send([{ subject: 'all', type: 'event', taxonomies: [] }]);

			expect(tagsMarkedStale()).toEqual(['nodes:event', 'type:event']);
		});
	});

	it('revalidates the path of a path change', async () => {
		const response = await send([
			{ subject: 'path', uri: '/feeds/events/' },
		]);

		expect(response.status).toBe(200);
		expect(revalidatePath).toHaveBeenCalledExactlyOnceWith(
			'/feeds/events/'
		);
		expect(revalidateTag).not.toHaveBeenCalled();
	});

	it('never marks stale a tag it expires, which would cancel the expiry', async () => {
		const stale = new Set<string>();
		const expired = new Set<string>();

		for (const change of [
			{
				subject: 'post',
				id: 42,
				type: 'post',
				before: { uri: '/hello/' },
				after: { uri: '/hello-world/' },
			},
			{
				subject: 'post',
				id: 42,
				type: 'post',
				before: { uri: '/hello-world/' },
				after: { uri: '/hello-world/' },
			},
			{ subject: 'redirect', uri: '/hello/' },
			{ subject: 'menu', id: 7, locations: [] },
			{ subject: 'templates' },
			{ subject: 'settings' },
			{ subject: 'all' },
			{ subject: 'all', type: 'post', taxonomies: ['category'] },
		]) {
			await send([change]);
			tagsMarkedStale().forEach((tag) => stale.add(tag));
			tagsExpired().forEach((tag) => expired.add(tag));
			vi.mocked(revalidateTag).mockClear();
		}

		expect(expired.size).toBeGreaterThan(0);
		expect([...stale].filter((tag) => expired.has(tag))).toEqual([]);
	});

	describe('ignores', () => {
		it('an unknown subject, and still clears the known ones', async () => {
			const response = await send([
				{ subject: 'comment', id: 3 },
				{ subject: 'templates' },
			]);

			expect(response.status).toBe(200);
			expect(tagsMarkedStale()).toEqual(['templates']);
		});

		it('an unknown field on a known subject', async () => {
			const response = await send([
				{
					subject: 'menu',
					id: 7,
					locations: [],
					blocks: ['core/navigation'],
				},
			]);

			expect(response.status).toBe(200);
			expect(tagsMarkedStale()).toEqual(['menu:7']);
		});

		// The plugin reports them from 2.1.0, but they're not mapped yet (#154)
		it.each([
			['a creation', null, { slug: 'video', uri: '/category/video/' }],
			[
				'a slug change',
				{ slug: 'video', uri: '/category/video/' },
				{ slug: 'videos', uri: '/category/videos/' },
			],
			['a delete', { slug: 'video', uri: '/category/video/' }, null],
		])('a term change: %s', async (_, before, after) => {
			const response = await send([
				{ subject: 'term', id: 5, taxonomy: 'category', before, after },
			]);

			expect(response.status).toBe(200);
			expect(revalidateTag).not.toHaveBeenCalled();
			expect(revalidatePath).not.toHaveBeenCalled();
		});

		it("a post's terms, and still clears the post", async () => {
			const response = await send([
				{
					subject: 'post',
					id: 42,
					type: 'post',
					before: {
						uri: '/hello/',
						terms: [{ id: 7, taxonomy: 'category', slug: 'video' }],
					},
					after: {
						uri: '/hello/',
						terms: [
							{ id: 9, taxonomy: 'category', slug: 'podcast' },
						],
					},
				},
			]);

			expect(response.status).toBe(200);
			expect(tagsMarkedStale()).toEqual([
				'content',
				'node:42',
				'type:post',
			]);
		});
	});

	// The plugin sends the secret in its own header when the revalidate domain
	// has basic-auth credentials (nextjs-revalidate 2.1+)
	describe('accepts the secret in X-Nextjs-Revalidate-Secret', () => {
		it.each([
			['next to basic-auth credentials', 'Basic dXNlcjpwYXNz'],
			['without an Authorization header', null],
		])('%s', async (_, authorization) => {
			const response = await route.POST(
				request(body([{ subject: 'templates' }]), {
					authorization,
					secret: SECRET,
				})
			);

			expect(response.status).toBe(200);
			expect(tagsMarkedStale()).toEqual(['templates']);
		});
	});

	describe('rejects', () => {
		it.each([
			['a missing secret', null],
			['a wrong secret', 'Bearer wrong-secret'],
			['a wrong secret of the same length', 'Bearer test-secreT'],
			['the secret without the Bearer scheme', SECRET],
			['basic-auth credentials alone', 'Basic dXNlcjpwYXNz'],
		])('%s with a 401', async (_, authorization) => {
			const response = await route.POST(
				request(body([{ subject: 'templates' }]), { authorization })
			);

			expect(response.status).toBe(401);
			expect(revalidateTag).not.toHaveBeenCalled();
		});

		it.each([
			['a wrong secret', 'wrong-secret'],
			['a wrong secret of the same length', 'test-secreT'],
			['the secret with the Bearer scheme', `Bearer ${SECRET}`],
			['an empty secret', ''],
		])('%s in X-Nextjs-Revalidate-Secret with a 401', async (_, secret) => {
			const response = await route.POST(
				request(body([{ subject: 'templates' }]), {
					authorization: 'Basic dXNlcjpwYXNz',
					secret,
				})
			);

			expect(response.status).toBe(401);
			expect(revalidateTag).not.toHaveBeenCalled();
		});

		// The secret is in exactly one of the two headers: the plugin's own
		// wins, so a valid Bearer can't make up for a wrong one there
		it('a wrong X-Nextjs-Revalidate-Secret next to a valid Bearer', async () => {
			const response = await route.POST(
				request(body([{ subject: 'templates' }]), {
					secret: 'wrong-secret',
				})
			);

			expect(response.status).toBe(401);
			expect(revalidateTag).not.toHaveBeenCalled();
		});

		it('every request when no secret is configured', async () => {
			vi.stubEnv('REVALIDATE_SECRET', '');

			const response = await route.POST(
				request(body([{ subject: 'templates' }]), {
					authorization: 'Bearer ',
					secret: '',
				})
			);

			expect(response.status).toBe(401);
			expect(revalidateTag).not.toHaveBeenCalled();
		});

		it.each([
			[
				'an unknown version',
				{ version: 3, changes: [{ subject: 'templates' }] },
			],
			['a v1 request', { path: '/hello-world/' }],
			['a body without changes', { version: 2 }],
			['a body that is not JSON', 'path=/hello-world/'],
		])('%s with a 400', async (_, payload) => {
			const response = await route.POST(request(payload));

			expect(response.status).toBe(400);
			expect(revalidateTag).not.toHaveBeenCalled();
			expect(revalidatePath).not.toHaveBeenCalled();
		});

		// Next.js answers a method the route doesn't export with a 405
		it('GET', () => {
			expect(route).not.toHaveProperty('GET');
		});
	});
});
