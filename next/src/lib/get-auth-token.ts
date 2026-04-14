import { fetchAPI } from '@/lib';

/**
 * Refresh the auth-token, thanks to the refresh-token
 * @returns {boolean} true if successful, false if auth failed
 */
export default async function getAuthToken(refreshToken: string) {
	try {
		const data = await fetchAPI(
			`
		mutation getAuthToken($refreshToken: String!) {
			__typename
			refreshJwtAuthToken(input: {jwtRefreshToken: $refreshToken}) {
				authToken
			}
		}
		`,
			{
				variables: {
					refreshToken,
				},
			}
		);
		return data?.refreshJwtAuthToken?.authToken ?? false;
	} catch {
		return false;
	}
}
