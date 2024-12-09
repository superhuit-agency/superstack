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

	// try {
	const res = await fetch(endpoint, {
		method: 'POST',
		headers,
		body: JSON.stringify({
			query: dedupeFragments(query),
			variables,
		}),
	});

	const { data, errors } = await res.json();

	if (errors) {
		const limit = '=================';
		const sep = '-----------------';
		const date = new Date().toISOString();
		const vars = JSON.stringify(variables, null, 2);
		const errs = errors
			.map((e: any) => `   - ${e.message} [${e.extensions.category}]`)
			.join('\n');

		throw new Error(
			`\n${limit}\nGraphQl API error\n${sep}\n== date: ${date}\n== errors: \n${errs}\n== query: ${name}\n== variables: ${vars}\n${limit}\n`
		);
	}
	result = data;
	// } catch (errors) {
	// 	(Array.isArray(errors) ? errors : [errors]).map((err) =>
	// 		console.error(err.message)
	// 	);
	// }

	// // Debug performances
	// fetchAPITester.markEnd(perfsId);

	return result;
};

export default fetchAPI;
