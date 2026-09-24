import { revalidatePath, revalidateTag } from 'next/cache';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as route from './route';

vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
	revalidateTag: vi.fn(),
}));

const SECRET = 'test-secret';

function request(
	body: unknown,
	{
		authorization = `Bearer ${SECRET}`,
	}: { authorization?: string | null } = {}
) {
	const headers = new Headers({ 'Content-Type': 'application/json' });
	if (authorization !== null) headers.set('Authorization', authorization);

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

/**
 * The tags marked stale (asserting they're all cleared with the `max`
 * profile), sorted: the order they're cleared in doesn't matter.
 */
function tagsMarkedStale() {
	return vi
		.mocked(revalidateTag)
		.mock.calls.map(([tag, profile]) => {
			expect(profile).toBe('max');
			return tag;
		})
		.sort();
}

beforeEach(() => {
	vi.stubEnv('REVALIDATE_SECRET', SECRET);
});

afterEach(() => {
	vi.unstubAllEnvs();
	vi.clearAllMocks();
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
		});

		it.each([
			['a publish', null, { uri: '/hello/' }],
			['an unpublish, trash or delete', { uri: '/hello/' }, null],
			['a slug change', { uri: '/hello/' }, { uri: '/hello-world/' }],
		])('also clears the cached 404s for %s', async (_, before, after) => {
			await send([
				{ subject: 'post', id: 42, type: 'event', before, after },
			]);

			expect(tagsMarkedStale()).toEqual([
				'content',
				'node:42',
				'type:event',
				'uris',
			]);
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
			'clears the redirect lookup of "%s" under its normalised URI',
			async (uri) => {
				await send([{ subject: 'redirect', uri }]);

				expect(tagsMarkedStale()).toEqual(['redirect:/old-path/']);
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
		it('clears everything for the whole site', async () => {
			await send([{ subject: 'all' }]);

			expect(tagsMarkedStale()).toEqual([
				'nodes',
				'settings',
				'templates',
				'uris',
			]);
		});

		it('clears the type and its taxonomies for one post type', async () => {
			await send([
				{
					subject: 'all',
					type: 'post',
					taxonomies: ['category', 'post_tag'],
				},
			]);

			expect(tagsMarkedStale()).toEqual([
				'taxonomy:category',
				'taxonomy:post_tag',
				'type:post',
			]);
		});

		it('clears the type for one post type with no taxonomies', async () => {
			await send([{ subject: 'all', type: 'event', taxonomies: [] }]);

			expect(tagsMarkedStale()).toEqual(['type:event']);
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

		// Mapped once the plugin reports term changes (nextjs-revalidate#55)
		it('a term change', async () => {
			const response = await send([
				{ subject: 'term', id: 5, taxonomy: 'category' },
			]);

			expect(response.status).toBe(200);
			expect(revalidateTag).not.toHaveBeenCalled();
		});
	});

	describe('rejects', () => {
		it.each([
			['a missing secret', null],
			['a wrong secret', 'Bearer wrong-secret'],
			['the secret without the Bearer scheme', SECRET],
		])('%s with a 401', async (_, authorization) => {
			const response = await route.POST(
				request(body([{ subject: 'templates' }]), { authorization })
			);

			expect(response.status).toBe(401);
			expect(revalidateTag).not.toHaveBeenCalled();
		});

		it('every request when no secret is configured', async () => {
			vi.stubEnv('REVALIDATE_SECRET', '');

			const response = await route.POST(
				request(body([{ subject: 'templates' }]), {
					authorization: 'Bearer ',
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
