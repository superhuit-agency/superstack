import { cookies } from 'next/headers';

/**
 * Get the region cookie
 * @returns {string} The region cookie value
 */
export const getRegionFromCookie = async () => {
	const cookieStore = await cookies();
	return cookieStore.get('region')?.value ?? 'global';
};
