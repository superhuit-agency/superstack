import { afterEach, describe, expect, it, vi } from 'vitest';

import fetchAPI from '@/lib/fetch-api';

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

	it('returns no data when a field errored next to fields that resolved', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		respond({
			data: { node: null, generalSettings: { title: 't' } },
			errors: [{ message: 'Internal server error', path: ['node'] }],
		});

		await expect(fetchAPI(query)).resolves.toEqual({});
	});

	it('returns no data when the read is rejected as a whole', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		respond({ errors: [{ message: 'Syntax Error' }] });

		await expect(fetchAPI(query)).resolves.toEqual({});
	});
});
