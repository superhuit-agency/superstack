import { useState, useEffect } from '@wordpress/element';

import { dedupeFragments } from '@/utils';
import { getQueryAttrs } from '#/utils';

declare global {
	interface Window {
		supt: any;
	}
}

export type useGraphQlApiResponse = {
	isLoading: boolean;
	data: any;
};

/**
 * Hook to retrieve dynamic data through the GraphQL API endpoint
 *
 * @param   {Function} getData     The function that will retrieve the dynamic data.
 * @param   {any}      variables   Optional. Variables to pass to `getData` function.
 * @param   {any}      getDataArgs Arguments to pass to `getData` function. Default: `{ isEditor: true }`
 * @returns {any}                  The dynamic data.
 */
export const useGraphQlApi = (
	getData: Function,
	variables?: object,
	isEditor: boolean = true
): useGraphQlApiResponse => {
	const [state, setState] = useState<useGraphQlApiResponse>({
		data: {},
		isLoading: true,
	});

	useEffect(() => {
		setState((prevState) => ({ ...prevState, isLoading: true }));

		getData(fetcher, variables, isEditor)
			.then((data: object) => {
				setState({
					data,
					isLoading: false,
				});
			})
			.catch((errors: Error) => {
				(Array.isArray(errors) ? errors : [errors]).map((err) =>
					console.error(err)
				);
				setState((prevState) => ({ ...prevState, isLoading: false }));
			});
	}, [variables, getData, isEditor]);

	return state;
};

const WP_DEFAULT_HEADERS = {
	Accept: `application/json`,
	'Content-Type': `application/json`,
	'X-WP-Nonce': window?.supt?.graphql?.nonce ?? null,
};
const WP_GRAPHQL_URL =
	window?.supt?.graphql?.endpoint ?? `${window.location.origin}/graphql`;

type fetchApiFuncType = (
	query: string,
	options?: {
		variables?: any;
		endpoint?: string;
		headers?: any;
	}
) => Promise<any>;

const fetcher: fetchApiFuncType = (query, options) =>
	new Promise((res, rej) => {
		const {
			variables,
			headers = WP_DEFAULT_HEADERS,
			endpoint = WP_GRAPHQL_URL,
		} = options ?? {};

		const body = JSON.stringify({
			query: dedupeFragments(query),
			variables: {
				stati: ['PUBLISH', 'DRAFT', 'PENDING', 'FUTURE'],
				...variables,
			},
		});

		fetch(endpoint, {
			method: 'POST',
			credentials: `include`,
			headers,
			body,
		})
			.then((res) => res.json())
			.then(({ data, errors }) => {
				if (errors) {
					const { name } = getQueryAttrs(query);
					const limit = '=================';
					const sep = '-----------------';
					const vars = JSON.stringify(variables, null, 2);
					const errs = errors
						.map((e: Error) => `   - ${e.message}`)
						.join('\n');

					rej(
						new Error(
							`\n${limit}\nGraphQL API error\n${sep}\n== errors: \n${errs}\n== query: ${name}\n== variables: ${vars}\n${limit}`
						)
					);
				}
				res(data);
			});
	});
