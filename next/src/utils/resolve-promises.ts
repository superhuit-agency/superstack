/**
 * Utility function to simplify working with multiple promises.
 * It encapsulates the use of Promise.allSettled and handles both fulfilled and rejected promises.
 *
 * @param promises - An array of promises to be resolved.
 * @param defaults - An optional array of default values to use when promises are rejected.
 * @returns A promise that resolves to an array where each element is either the resolved value, the corresponding default value, or null.
 * @template T - A tuple type representing the types of the input promises.
 */
export const resolvePromises = async <T extends readonly unknown[]>(
	promises: [...{ [K in keyof T]: Promise<T[K]> }],
	defaults?: Partial<{ [K in keyof T]: T[K] }>
): Promise<{ [K in keyof T]: T[K] | null }> => {
	const results = await Promise.allSettled(promises);
	return results.map((r, index) => {
		if (r.status === 'fulfilled') {
			return r.value;
		}
		return defaults && index in defaults ? defaults[index] : null;
	}) as { [K in keyof T]: T[K] | null };
};
