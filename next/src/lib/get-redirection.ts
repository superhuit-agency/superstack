import { cacheLife, cacheTag } from 'next/cache';

import { gql } from '@/utils';
import { fetchAPI } from '@/lib';
import { cacheTags } from '@/lib/cache-tags';

/**
 * Cached per URI, including a "no redirect" result.
 *
 * @param {string} uri
 */
export default async function getRedirection(uri: string) {
	'use cache';
	cacheLife('max');
	cacheTag(cacheTags.redirect(uri), cacheTags.nodes());

	const { redirections } = await fetchAPI(
		gql`
			query redirectionsQuery($uri: String!) {
				redirections(uri: $uri) {
					code
					target
				}
			}
		`,
		{
			variables: {
				uri,
			},
		}
	);

	return redirections === null ||
		redirections === undefined ||
		!redirections[0]
		? null
		: {
				destination: redirections[0].target,
				isPermanent: redirections[0].code === 301,
			};
}
