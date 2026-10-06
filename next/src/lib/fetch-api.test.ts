import { afterEach, describe, expect, it, vi } from 'vitest';

import fetchAPI from '@/lib/fetch-api';
import { isWordPressReadError } from '@/lib/wordpress-read-error';

const respond = (body: unknown) =>
	vi.stubGlobal(
		'fetch',
		vi.fn(async () => new Response(JSON.stringify(body), { status: 200 }))
	);

const query = `
	query NodeByUri($uri: String!) {
		node: nodeByUri(uri: $uri) {
			uri
		}
		generalSettings {
			title
		}
	}
`;

describe('fetchAPI', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('returns the data of a successful read', async () => {
		respond({
			data: { node: { uri: '/about/' }, generalSettings: { title: 't' } },
		});

		await expect(fetchAPI(query)).resolves.toEqual({
			node: { uri: '/about/' },
			generalSettings: { title: 't' },
		});
	});

	it('fails the read when a field errored next to fields that resolved', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		respond({
			data: { node: null, generalSettings: { title: 't' } },
			errors: [{ message: 'Internal server error', path: ['node'] }],
		});

		const error = await fetchAPI(query).catch((e) => e);

		expect(isWordPressReadError(error)).toBe(true);
		expect(error.digest).toBe('WORDPRESS_READ_FAILED:NodeByUri');
	});

	it('fails the read when it is rejected as a whole', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		respond({ errors: [{ message: 'Syntax Error' }] });

		const error = await fetchAPI(query).catch((e) => e);

		expect(isWordPressReadError(error)).toBe(true);
	});

	it('fails the read when WordPress does not answer', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => {
				throw new TypeError('fetch failed');
			})
		);

		const error = await fetchAPI(query).catch((e) => e);

		expect(isWordPressReadError(error)).toBe(true);
	});

	it('fails the read when WordPress answers with something other than JSON', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => new Response('<html>502</html>', { status: 502 }))
		);

		const error = await fetchAPI(query).catch((e) => e);

		expect(isWordPressReadError(error)).toBe(true);
	});
});
