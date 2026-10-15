import { cacheLife, cacheTag } from 'next/cache';

import { gql } from '@/utils';
import { fetchAPI } from '@/lib';
import { cacheTags } from '@/lib/cache-tags';
import type {
	RedirectionsQuery,
	RedirectionsQueryVariables,
} from '@/__generated__/graphql';

/**
 * Cached per URI, including a "no redirect" result.
 *
 * @param {string} uri
 */
export default async function getRedirection(uri: string) {
	'use cache';
	cacheLife('max');
	cacheTag(cacheTags.redirect(uri), cacheTags.redirects(), cacheTags.nodes());

	const { redirections } = await fetchAPI<
		RedirectionsQuery,
		RedirectionsQueryVariables
	>(
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

	// Missing when the request failed: don't let a failure be cached as "no redirect"
	if (redirections === undefined) {
		throw new Error(
			`Could not read the redirections of "${uri}" from WordPress`
		);
	}

	const [redirection] = redirections ?? [];

	// A redirection without a target (an error action) has nowhere to send to
	return !redirection?.target
		? null
		: {
				destination: redirection.target,
				isPermanent:
					redirection.code === 301 || redirection.code === 308,
			};
}
