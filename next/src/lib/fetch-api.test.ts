import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import fetchAPI from '@/lib/fetch-api';
import { isWordPressReadError } from '@/lib/wordpress-read-error';

const respond = (body: unknown) =>
	vi.stubGlobal(
		'fetch',
		vi.fn(async () => new Response(JSON.stringify(body), { status: 200 }))
	);

const ok = (body: unknown) =>
	new Response(JSON.stringify(body), { status: 200 });

// What undici's fetch rejects with when the connection fails before an answer
const connectionReset = () =>
	new TypeError('fetch failed', {
		cause: Object.assign(new Error('read ECONNRESET'), {
			code: 'ECONNRESET',
		}),
	});

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
		vi.useRealTimers();
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

	it('fails the read when the answer has neither data nor errors', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		respond({});

		const error = await fetchAPI(query).catch((e) => e);

		expect(isWordPressReadError(error)).toBe(true);
	});

	it('fails the read when WordPress does not answer', async () => {
		vi.useFakeTimers();
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => {
				throw new TypeError('fetch failed');
			})
		);

		const read = fetchAPI(query).catch((e) => e);
		await vi.runAllTimersAsync();
		const error = await read;

		expect(isWordPressReadError(error)).toBe(true);
	});

	it('fails the read when WordPress answers with something other than JSON', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.stubGlobal(
			'fetch',
			vi.fn(
				async () => new Response('<html>Notice</html>', { status: 200 })
			)
		);

		const error = await fetchAPI(query).catch((e) => e);

		expect(isWordPressReadError(error)).toBe(true);
	});

	describe('retries', () => {
		const data = {
			data: { node: { uri: '/about/' }, generalSettings: { title: 't' } },
		};

		let warn: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			vi.useFakeTimers();
			// No jitter: the backoff is 1 s, 2 s, 4 s, 8 s
			vi.spyOn(Math, 'random').mockReturnValue(0.5);
			warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		});

		it('retries a read WordPress answered with a 503', async () => {
			const fetchMock = vi
				.fn()
				.mockResolvedValueOnce(new Response('', { status: 503 }))
				.mockResolvedValueOnce(ok(data));
			vi.stubGlobal('fetch', fetchMock);

			const read = fetchAPI(query);
			await vi.runAllTimersAsync();

			await expect(read).resolves.toEqual(data.data);
			expect(fetchMock).toHaveBeenCalledTimes(2);
		});

		it('cancels the body of a response it retries', async () => {
			const refused = new Response('busy', { status: 503 });
			const cancel = vi.spyOn(refused.body!, 'cancel');
			vi.stubGlobal(
				'fetch',
				vi
					.fn()
					.mockResolvedValueOnce(refused)
					.mockResolvedValueOnce(ok(data))
			);

			const read = fetchAPI(query);
			await vi.runAllTimersAsync();
			await read;

			expect(cancel).toHaveBeenCalled();
		});

		it('retries a read whose connection failed before WordPress answered', async () => {
			const fetchMock = vi
				.fn()
				.mockRejectedValueOnce(connectionReset())
				.mockResolvedValueOnce(ok(data));
			vi.stubGlobal('fetch', fetchMock);

			const read = fetchAPI(query);
			await vi.runAllTimersAsync();

			await expect(read).resolves.toEqual(data.data);
			expect(fetchMock).toHaveBeenCalledTimes(2);
		});

		it('gives each attempt a timeout, and retries one that timed out', async () => {
			const fetchMock = vi
				.fn()
				.mockRejectedValueOnce(
					new DOMException('The operation timed out.', 'TimeoutError')
				)
				.mockResolvedValueOnce(ok(data));
			vi.stubGlobal('fetch', fetchMock);

			const read = fetchAPI(query);
			await vi.runAllTimersAsync();

			await expect(read).resolves.toEqual(data.data);
			expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(
				AbortSignal
			);
			expect(warn.mock.calls[0].join(' ')).toContain(
				'no answer within 15000 ms'
			);
		});

		it('waits as long as Retry-After asks', async () => {
			const fetchMock = vi
				.fn()
				.mockResolvedValueOnce(
					new Response('', {
						status: 429,
						headers: { 'Retry-After': '3' },
					})
				)
				.mockResolvedValueOnce(ok(data));
			vi.stubGlobal('fetch', fetchMock);

			const read = fetchAPI(query);
			await vi.advanceTimersByTimeAsync(2999);
			expect(fetchMock).toHaveBeenCalledTimes(1);

			await vi.advanceTimersByTimeAsync(1);
			await expect(read).resolves.toEqual(data.data);
			expect(fetchMock).toHaveBeenCalledTimes(2);
		});

		it('gives up when Retry-After asks for longer than it can wait', async () => {
			vi.spyOn(console, 'error').mockImplementation(() => {});
			const fetchMock = vi.fn().mockResolvedValue(
				new Response('', {
					status: 503,
					headers: { 'Retry-After': '60' },
				})
			);
			vi.stubGlobal('fetch', fetchMock);

			const read = fetchAPI(query).catch((e) => e);
			await vi.runAllTimersAsync();

			expect(isWordPressReadError(await read)).toBe(true);
			expect(fetchMock).toHaveBeenCalledTimes(1);
		});

		it('fails a read whose connection keeps failing, naming the cause', async () => {
			const consoleError = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});
			const fetchMock = vi.fn().mockRejectedValue(connectionReset());
			vi.stubGlobal('fetch', fetchMock);

			const read = fetchAPI(query).catch((e) => e);
			await vi.runAllTimersAsync();

			expect(isWordPressReadError(await read)).toBe(true);
			expect(fetchMock).toHaveBeenCalledTimes(5);
			expect(consoleError.mock.calls.flat().join('\n')).toContain(
				'fetch failed (ECONNRESET) after 5 attempts'
			);
		});

		it('sends a mutation once', async () => {
			vi.spyOn(console, 'error').mockImplementation(() => {});
			const fetchMock = vi
				.fn()
				.mockResolvedValue(new Response('', { status: 503 }));
			vi.stubGlobal('fetch', fetchMock);

			const read = fetchAPI(
				`mutation Refresh($t: String!) { refreshJwtAuthToken(input: { jwtRefreshToken: $t }) { authToken } }`
			).catch((e) => e);
			await vi.runAllTimersAsync();

			expect(isWordPressReadError(await read)).toBe(true);
			expect(fetchMock).toHaveBeenCalledTimes(1);
		});

		it('keeps at most 4 requests in flight', async () => {
			const pending: Array<() => void> = [];
			const fetchMock = vi.fn(
				() =>
					new Promise<Response>((resolve) =>
						pending.push(() => resolve(ok(data)))
					)
			);
			vi.stubGlobal('fetch', fetchMock);

			const reads = Array.from({ length: 5 }, () => fetchAPI(query));
			await vi.advanceTimersByTimeAsync(0);
			expect(fetchMock).toHaveBeenCalledTimes(4);

			pending.shift()!();
			await vi.advanceTimersByTimeAsync(0);
			expect(fetchMock).toHaveBeenCalledTimes(5);

			pending.forEach((release) => release());
			await expect(Promise.all(reads)).resolves.toHaveLength(5);
		});
	});
});
