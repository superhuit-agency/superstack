import { getWpGraphqlUrl } from '@/utils/node-utils';
import { dedupeFragments, getQueryAttrs } from '@/utils';

const WP_GRAPHQL_URL = getWpGraphqlUrl();

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

	const { name } = getQueryAttrs(query);
	// console.debug('== fetchAPI %s - %s', name, type);
	// // Debug performances
	// const perfsId = fetchAPITester.markStart(`${type} - ${name}`);

	let dedupedQuery = dedupeFragments(query);

	try {
		const res = await fetch(endpoint, {
			method: 'POST',
			headers,
			body: JSON.stringify({
				query: dedupedQuery,
				variables,
			}),
		});

		let resText;
		let data, errors;

		try {
			// We first convert the response to text,
			// to be able to console.error the response
			// in case the JSON parsing fails
			resText = await res.text();
			const resJson = JSON.parse(resText);
			data = resJson.data;
			errors = resJson.errors;
		} catch (error) {
			throw new Error(
				`\t- Could not parse json response. \n\t- ${error}\n\t- Text response: \n\t${resText?.slice(0, 1000)}...`
			);
		}

		// Make sure to return the data if any
		// even if there are some errors
		if (!!data) result = data;

		if (errors) {
			const errs = errors
				.map((e: any) => `\t- ${e.message} [${e.extensions?.category}]`)
				.join('\n');

			throw new Error(errs);
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
	}

	// // Debug performances
	// fetchAPITester.markEnd(perfsId);

	return result;
};

export default fetchAPI;
