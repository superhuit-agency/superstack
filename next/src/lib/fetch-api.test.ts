import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import fetchAPI from '@/lib/fetch-api';
import { isWordPressReadError } from '@/lib/wordpress-read-error';

// `WORDPRESS_FETCH_CONCURRENCY`'s default
const CAP = 6;

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

		it.each([
			[
				'a named mutation',
				`mutation Refresh($t: String!) { refreshJwtAuthToken(input: { jwtRefreshToken: $t }) { authToken } }`,
			],
			['an anonymous mutation', `mutation { logout { status } }`],
			[
				'a mutation with variables and no name',
				`mutation($t: String!) { refreshJwtAuthToken(input: { jwtRefreshToken: $t }) { authToken } }`,
			],
			[
				'a mutation after a comment naming a query',
				`# query Old, kept for reference\nmutation Send { sendForm { ok } }`,
			],
			[
				'a mutation after a fragment',
				`fragment F on Payload { ok }\nmutation Send { sendForm { ...F } }`,
			],
		])('sends %s once', async (_, mutation) => {
			vi.spyOn(console, 'error').mockImplementation(() => {});
			const fetchMock = vi
				.fn()
				.mockResolvedValue(new Response('', { status: 503 }));
			vi.stubGlobal('fetch', fetchMock);

			const read = fetchAPI(mutation).catch((e) => e);
			await vi.runAllTimersAsync();

			expect(isWordPressReadError(await read)).toBe(true);
			expect(fetchMock).toHaveBeenCalledTimes(1);
		});

		it.each([
			['a comment', `# Not a mutation\nquery Menu { menu { name } }`],
			['a string', `query Log { logs(type: "mutation") { id } }`],
			['a field', `query Log { mutation { id } }`],
			['a variable', `query Log($mutation: Boolean) { logs { id } }`],
		])('retries a query that says "mutation" in %s', async (_, read) => {
			const fetchMock = vi
				.fn()
				.mockResolvedValueOnce(new Response('', { status: 503 }))
				.mockResolvedValueOnce(ok(data));
			vi.stubGlobal('fetch', fetchMock);

			const result = fetchAPI(read);
			await vi.runAllTimersAsync();

			await expect(result).resolves.toEqual(data.data);
			expect(fetchMock).toHaveBeenCalledTimes(2);
		});

		it(`keeps at most ${CAP} requests in flight`, async () => {
			const pending: Array<() => void> = [];
			const fetchMock = vi.fn(
				() =>
					new Promise<Response>((resolve) =>
						pending.push(() => resolve(ok(data)))
					)
			);
			vi.stubGlobal('fetch', fetchMock);

			const reads = Array.from({ length: CAP + 1 }, () =>
				fetchAPI(query)
			);
			await vi.advanceTimersByTimeAsync(0);
			expect(fetchMock).toHaveBeenCalledTimes(CAP);

			pending.shift()!();
			await vi.advanceTimersByTimeAsync(0);
			expect(fetchMock).toHaveBeenCalledTimes(CAP + 1);

			pending.forEach((release) => release());
			await expect(Promise.all(reads)).resolves.toHaveLength(CAP + 1);
		});

		it('frees its slot whatever the outcome', async () => {
			vi.spyOn(console, 'error').mockImplementation(() => {});
			const mutation = `mutation Send { sendForm { ok } }`;
			const droppedBody = () =>
				new Response(
					new ReadableStream({
						start: (controller) =>
							controller.error(new TypeError('terminated')),
					})
				);
			const fetchMock = vi
				.fn()
				.mockResolvedValueOnce(new Response('', { status: 503 }))
				.mockResolvedValueOnce(new Response('', { status: 503 }))
				.mockRejectedValueOnce(connectionReset())
				.mockRejectedValueOnce(connectionReset())
				.mockResolvedValueOnce(droppedBody())
				.mockResolvedValueOnce(droppedBody())
				.mockResolvedValueOnce(
					new Response('<html>Notice</html>', { status: 200 })
				)
				.mockResolvedValueOnce(
					new Response('<html>Notice</html>', { status: 200 })
				)
				.mockImplementation(async () => ok(data));
			vi.stubGlobal('fetch', fetchMock);

			const failed = Promise.all(
				Array.from({ length: 8 }, () =>
					fetchAPI(mutation).catch((e) => e)
				)
			);
			await vi.runAllTimersAsync();
			const errors = await failed;
			expect(errors.every(isWordPressReadError)).toBe(true);

			const reads = Array.from({ length: CAP }, () => fetchAPI(query));
			await vi.advanceTimersByTimeAsync(0);
			expect(fetchMock).toHaveBeenCalledTimes(8 + CAP);
			await expect(Promise.all(reads)).resolves.toHaveLength(CAP);
		});

		it('counts the wait for a slot in its 45 s, and fails naming it', async () => {
			const consoleError = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});
			// Reads that take longer than the budget hold every slot
			const fetchMock = vi.fn(
				() =>
					new Promise<Response>((resolve) =>
						setTimeout(() => resolve(ok(data)), 46000)
					)
			);
			vi.stubGlobal('fetch', fetchMock);

			const busy = Array.from({ length: CAP }, () => fetchAPI(query));
			const queued = fetchAPI(query).catch((e) => e);

			await vi.advanceTimersByTimeAsync(44999);
			expect(consoleError).not.toHaveBeenCalled();

			await vi.advanceTimersByTimeAsync(1);
			expect(isWordPressReadError(await queued)).toBe(true);
			expect(consoleError.mock.calls.flat().join('\n')).toContain(
				'No free slot before the 45000 ms budget ran out'
			);

			await vi.advanceTimersByTimeAsync(1000);
			await expect(Promise.all(busy)).resolves.toHaveLength(CAP);
			expect(fetchMock).toHaveBeenCalledTimes(CAP);
		});

		it("doesn't retry past its 45 s, counting the wait for a slot", async () => {
			vi.spyOn(console, 'error').mockImplementation(() => {});
			let calls = 0;
			// Reads hold every slot for 40 s, then the queued one gets a
			// 503 it has no time left to retry
			const fetchMock = vi.fn(() => {
				calls++;
				return calls <= CAP
					? new Promise<Response>((resolve) =>
							setTimeout(() => resolve(ok(data)), 40000)
						)
					: Promise.resolve(new Response('', { status: 503 }));
			});
			vi.stubGlobal('fetch', fetchMock);
			vi.spyOn(Math, 'random').mockReturnValue(0.5);

			const busy = Array.from({ length: CAP }, () => fetchAPI(query));
			const queued = fetchAPI(query).catch((e) => e);
			await vi.runAllTimersAsync();

			expect(isWordPressReadError(await queued)).toBe(true);
			await Promise.all(busy);
			// 40 s queued, then 503s after 1 s and 2 s of backoff: the next
			// 4 s would end past 45 s
			expect(fetchMock).toHaveBeenCalledTimes(CAP + 3);
		});
	});
});
