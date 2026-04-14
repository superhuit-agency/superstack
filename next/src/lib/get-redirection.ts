import { gql } from '@/utils';
import { fetchAPI } from '@/lib';

/**
 *
 * @param {string} uri
 */
export default async function getRedirection(uri: string) {
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
