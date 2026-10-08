import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * Whether a given secret matches the expected one, in constant time.
 *
 * @param {string} given    The secret from the request
 * @param {string} expected The configured secret
 */
export default function secretMatches(given: string, expected: string) {
	// Hashed first: `timingSafeEqual` needs equal lengths, and checking them
	// would leak the secret's
	return timingSafeEqual(sha256(given), sha256(expected));
}

function sha256(value: string): Buffer {
	return createHash('sha256').update(value).digest();
}
