import { getWpGraphqlUrl } from '@/utils/node-utils';
import { dedupeFragments } from '@/utils';
import { getQueryAttrs } from '#/utils';

const WP_GRAPHQL_URL = getWpGraphqlUrl();

// // Debug performances
// export const fetchAPITester = PerfsTester();

const fetchAPI: FetchApiFuncType = async (query, options) => {
	const {
		variables,
		auth,
		headers = {},
		endpoint = WP_GRAPHQL_URL,
	} = options ?? {};

	headers['Content-Type'] = 'application/json';

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

		if (errors) {
			const errs = errors
				.map((e: any) => `\t- ${e.message} [${e.extensions.category}]`)
				.join('\n');

			throw new Error(errs);
		}

		result = data;
	} catch (errors) {
		const limit = '=================';
		const sep = '-----------------';
		const vars = JSON.stringify(variables);

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
