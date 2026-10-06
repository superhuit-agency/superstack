import { getWpGraphqlUrl } from '@/utils/node-utils';
import { dedupeFragments, getQueryAttrs } from '@/utils';
import { WordPressReadError } from '@/lib/wordpress-read-error';

const WP_GRAPHQL_URL = getWpGraphqlUrl();

// WordPress, or its host, refuses bursts (503/429) when a re-render or a build
// sends many reads at once, and connections drop. Retry those with a jittered
// exponential backoff before failing.
const MAX_RETRIES = Number(process.env.WORDPRESS_FETCH_MAX_RETRIES ?? 4);
const RETRY_DELAY = Number(process.env.WORDPRESS_FETCH_RETRY_DELAY ?? 1000);
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

// Without a timeout, a WordPress that accepts the connection but never answers
// costs undici's 300 s headers timeout on every attempt.
const TIMEOUT = Number(process.env.WORDPRESS_FETCH_TIMEOUT ?? 15000);

// Next gives a `'use cache'` entry 50 s to fill during a prerender: stop
// retrying before that, so the read fails with its own cause.
const BUDGET = Math.max(45000, TIMEOUT);

// WordPress requests in flight at once, per process. PHP-FPM's default pool
// has 5 workers, and editors need one too.
const CONCURRENCY = Math.max(
	1,
	Number(process.env.WORDPRESS_FETCH_CONCURRENCY ?? 4)
);

let active = 0;
const waiting: Array<() => void> = [];

/** Run `task` once fewer than `CONCURRENCY` others are running. */
async function withSlot<T>(task: () => Promise<T>): Promise<T> {
	if (active < CONCURRENCY) active++;
	else await new Promise<void>((resolve) => waiting.push(resolve));

	try {
		return await task();
	} finally {
		// Hand the slot over, or free it
		const next = waiting.shift();
		if (next) next();
		else active--;
	}
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** `Retry-After` in milliseconds, given in seconds or as an HTTP date. */
function parseRetryAfter(header: string | null): number | null {
	if (!header) return null;

	const seconds = Number(header);
	if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);

	const date = Date.parse(header);
	return Number.isNaN(date) ? null : Math.max(0, date - Date.now());
}

/**
 * A rejected `fetch()` only says "fetch failed": what failed (`ECONNRESET`,
 * `UND_ERR_CONNECT_TIMEOUT`, `ENOTFOUND`…) is in its `cause`.
 */
function describeFetchError(error: unknown, timeout: number): string {
	if (!(error instanceof Error)) return String(error);
	if (error.name === 'TimeoutError') return `no answer within ${timeout} ms`;

	const cause = error.cause as { code?: unknown; message?: unknown } | null;
	const detail = cause?.code ?? cause?.message;

	return detail ? `${error.message} (${detail})` : error.message;
}

type Attempt =
	| { text: string }
	| { failure: string; retryAfter?: number | null };

// // Debug performances
// export const fetchAPITester = PerfsTester();

/**
 * Variable names whose values must never reach the logs. GraphQL variables are
 * dumped verbatim in the error block below, so credentials passed to mutations
 * (`login`, `registerUser`, `resetUserPassword`, `refreshJwtAuthToken`) would
 * otherwise sit in cleartext in the server logs on every failed attempt.
 *
 * Matched as substrings on purpose, so compounds like `apiKey`, `resetKey` or
 * `privateKey` are caught too. Over-matching (`monkey`, `keyword`) only costs
 * us a little log detail; under-matching leaks a credential.
 */
const SENSITIVE_VARIABLE_PATTERN =
	/pass|pwd|secret|token|key|credential|otp|nonce/i;

const REDACTED = '[redacted]';

/** Recursively replace the values of sensitive-looking keys with a placeholder. */
function redactVariables(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map(redactVariables);
	}

	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value as Record<string, unknown>).map(
				([key, val]) => [
					key,
					SENSITIVE_VARIABLE_PATTERN.test(key)
						? REDACTED
						: redactVariables(val),
				]
			)
		);
	}

	return value;
}

const fetchAPI: FetchApiFuncType = async (query, options) => {
	const {
		variables,
		auth,
		headers: callerHeaders,
		endpoint = WP_GRAPHQL_URL,
	} = options ?? {};

	// Copied, not mutated: callers pass headers they may reuse across calls.
	const headers: Record<string, string> = {
		...callerHeaders,
		'Content-Type': 'application/json',
	};

	if (auth?.authToken) {
		headers['Authorization'] = `Bearer ${auth?.authToken}`;
	}

	let result: any = {};

	const { name, type } = getQueryAttrs(query);
	// console.debug('== fetchAPI %s - %s', name, type);
	// // Debug performances
	// const perfsId = fetchAPITester.markStart(`${type} - ${name}`);

	let dedupedQuery = dedupeFragments(query);

	// A mutation may not be safe to send twice: it gets one attempt
	const attempts = type === 'mutation' ? 1 : MAX_RETRIES + 1;
	let deadline = 0;

	// One request, response body included, inside a concurrency slot
	const attempt = () =>
		withSlot(async (): Promise<Attempt> => {
			if (!deadline) deadline = Date.now() + BUDGET;
			const timeout = Math.max(
				0,
				Math.min(TIMEOUT, deadline - Date.now())
			);

			try {
				const res = await fetch(endpoint, {
					method: 'POST',
					headers,
					body: JSON.stringify({
						query: dedupedQuery,
						variables,
					}),
					signal: AbortSignal.timeout(timeout),
				});

				if (RETRYABLE_STATUS.has(res.status)) {
					// Unread, the body would hold its connection until GC
					await res.body?.cancel();
					return {
						failure: `The server responded with ${res.status} ${res.statusText}`,
						retryAfter: parseRetryAfter(
							res.headers.get('Retry-After')
						),
					};
				}

				// We first convert the response to text,
				// to be able to console.error the response
				// in case the JSON parsing fails
				return { text: await res.text() };
			} catch (error) {
				// The connection failed, timed out or dropped mid-body: as
				// transient as a 503
				return { failure: describeFetchError(error, timeout) };
			}
		});

	try {
		let resText: string;

		for (let n = 1; ; n++) {
			const outcome = await attempt();

			if ('text' in outcome) {
				resText = outcome.text;
				break;
			}

			const backoff = RETRY_DELAY * 2 ** (n - 1) * (0.5 + Math.random());
			const delay = Math.max(backoff, outcome.retryAfter ?? 0);

			if (n >= attempts || Date.now() + delay >= deadline) {
				throw new Error(
					`\t- ${outcome.failure}${n > 1 ? ` after ${n} attempts` : ''}.`
				);
			}

			console.warn(
				'== fetchAPI %s - %s, retrying in %sms (%s/%s)',
				name,
				outcome.failure,
				Math.round(delay),
				n,
				attempts - 1
			);
			await wait(delay);
		}

		let data, errors;

		try {
			const resJson = JSON.parse(resText);
			data = resJson.data;
			errors = resJson.errors;
		} catch (error) {
			throw new Error(
				`\t- Could not parse json response. \n\t- ${error}\n\t- Text response: \n\t${resText?.slice(0, 1000)}...`
			);
		}

		// A field that failed resolves to `null` next to the data that didn't:
		// returning that partial data would read as "nothing there", and be
		// cached as such, so any error fails the whole read.
		if (errors) {
			const errs = errors
				.map((e: any) => `\t- ${e.message} [${e.extensions?.category}]`)
				.join('\n');

			throw new Error(errs);
		}

		// Without `errors`, a GraphQL answer always has `data`: anything else
		// isn't WordPress answering
		if (!data) {
			throw new Error(
				`\t- The response has neither data nor errors.\n\t- Text response: \n\t${resText?.slice(0, 1000)}...`
			);
		}

		result = data;
	} catch (errors) {
		const limit = '=================';
		const sep = '-----------------';
		const vars = JSON.stringify(redactVariables(variables));

		(Array.isArray(errors) ? errors : [errors]).map((err) =>
			console.error(`
${limit}
GraphQl API error
${sep}
== date:\t  ${new Date().toISOString()}
== endpoint: ${endpoint}
== query:
	- name:       ${name}
	- variables:  ${vars ?? '-'}
	- full query: "${dedupedQuery.replace(/[\n\t\s]+/g, ' ')}"
== error:
${err.message}
${limit}
`)
		);

		// A failed read is never data: callers that turned `{}` into an empty
		// result would cache it with `cacheLife('max')`. The digest survives a
		// `use cache` boundary, so the public render fails and keeps serving the
		// previous entry, while preview falls back to the block's attributes.
		throw new WordPressReadError(
			`the "${name || 'unnamed'}" query`,
			name || 'query'
		);
	}

	// // Debug performances
	// fetchAPITester.markEnd(perfsId);

	return result;
};

export default fetchAPI;
