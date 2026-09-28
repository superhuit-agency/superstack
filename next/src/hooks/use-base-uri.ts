import { cache } from 'react';

const cachedContext = cache(() => new Map<string, string>());

const BASE_URI_NOT_DECLARED = 'BASE_URI_NOT_DECLARED';

/**
 * Thrown when a block that doesn't declare `usesBaseUri` reads the Base URI
 * inside its cached block-data scope.
 *
 * Carries a `digest`, which Next keeps when the error crosses a `use cache`
 * boundary (the message and class don't survive it in production).
 */
export class BaseUriNotDeclaredError extends Error {
	digest: string;

	constructor(blockName: string) {
		super(
			`Block "${blockName}" read the Base URI without declaring it. ` +
				`Add \`export const usesBaseUri = true;\` to its data module. ` +
				`Its data is otherwise cached once per site, so the page that ` +
				`fills the cache would leak its content into every other page.`
		);
		this.name = 'BaseUriNotDeclaredError';
		this.digest = `${BASE_URI_NOT_DECLARED}:${blockName}`;
	}
}

export const isBaseUriNotDeclaredError = (error: unknown) =>
	typeof (error as { digest?: unknown })?.digest === 'string' &&
	(error as { digest: string }).digest.startsWith(
		`${BASE_URI_NOT_DECLARED}:`
	);

/**
 * Rethrows a `BaseUriNotDeclaredError` from settled block-data promises,
 * which otherwise swallow block-data errors: it must fail `next build`.
 */
export const throwIfBaseUriNotDeclared = (
	results: PromiseSettledResult<unknown>[]
) => {
	const failure = results.find(
		(result): result is PromiseRejectedResult =>
			result.status === 'rejected' &&
			isBaseUriNotDeclaredError(result.reason)
	);

	if (failure) throw failure.reason;
};

/**
 * Makes reading the Base URI throw for the rest of the current scope.
 * Set by the cached block-data wrapper for blocks that don't opt in.
 *
 * Relies on each `use cache` call getting its own React `cache()` scope:
 * called outside one, it would guard every later read in the request.
 */
export const guardBaseUri = (blockName: string) => {
	cachedContext().set('guardedBlock', blockName);
};

export const baseUriContext = (uri?: string) => {
	const cache = cachedContext();

	if (!uri) {
		const guardedBlock = cache.get('guardedBlock');
		if (guardedBlock) throw new BaseUriNotDeclaredError(guardedBlock);

		return cache.get('baseUri');
	}

	cache.set('baseUri', uri);

	return {
		get Value() {
			return cache.get('baseUri') ?? '';
		},
		set Value(value: string) {
			cache.set('baseUri', value);
		},
	};
};
