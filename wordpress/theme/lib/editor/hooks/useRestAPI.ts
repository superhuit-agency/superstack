import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { useState, useMemo, useEffect } from '@wordpress/element';

import { POST_PT_NAME } from '#/constants';
import { WpMediaRest, WpPostRest, WpTermRest } from '#/typings';

type WP_REST_RESPONSE_TYPES =
	| WpMediaRest
	| WpPostRest
	| WpTermRest
	| Array<WpMediaRest>
	| Array<WpPostRest>
	| Array<WpTermRest>;

export type useRestAPIResponse<T> = {
	isLoading: boolean;
	data: T;
};

export const useRestAPI = <T extends WP_REST_RESPONSE_TYPES>(
	endpoint = POST_PT_NAME,
	args: Record<string, any>
): useRestAPIResponse<T> => {
	const [state, setState] = useState<useRestAPIResponse<T>>({
		data: [] as unknown as T,
		isLoading: true,
	});

	const path = useMemo(
		() =>
			addQueryArgs(
				`/wp/v2/${endpoint}${args?.id ? `/${args.id}` : ''}`,
				args
			),
		[endpoint, args]
	);

	useEffect(() => {
		setState((prevState) => ({ ...prevState, isLoading: true }));

		apiFetch({ path })
			.then((data: unknown) =>
				setState({ data, isLoading: false } as useRestAPIResponse<T>)
			)
			.catch((error: Error) => {
				console.error(
					`Error while fetching REST API: /wp/v2/${endpoint}. ${error.message}`
				);
				setState((prevState) => ({ ...prevState, isLoading: false }));
			});
	}, [path, endpoint, args]);

	return state;
};
