const WORDPRESS_READ_FAILED = 'WORDPRESS_READ_FAILED';

/**
 * Thrown by a block's `getData` when WordPress didn't answer its read, as
 * opposed to answering that there's nothing to show.
 *
 * Carries a `digest`, which Next keeps when the error crosses a `use cache`
 * boundary (the message and class don't survive it in production). Next also
 * shows it on the public error page: `key` is a short identifier without
 * spaces, e.g. the cache tag of what failed to read.
 */
export class WordPressReadError extends Error {
	digest: string;

	constructor(what: string, key: string) {
		super(`Could not read ${what} from WordPress`);
		this.name = 'WordPressReadError';
		this.digest = `${WORDPRESS_READ_FAILED}:${key}`;
	}
}

export const isWordPressReadError = (error: unknown) =>
	typeof (error as { digest?: unknown })?.digest === 'string' &&
	(error as { digest: string }).digest.startsWith(
		`${WORDPRESS_READ_FAILED}:`
	);

/**
 * Rethrows a `WordPressReadError` from settled block-data promises, which
 * otherwise swallow block-data errors: it must fail the public page render,
 * so the failure is never cached in place of the data.
 */
export const throwIfWordPressReadFailed = (
	results: PromiseSettledResult<unknown>[]
) => {
	const failure = results.find(
		(result): result is PromiseRejectedResult =>
			result.status === 'rejected' && isWordPressReadError(result.reason)
	);

	if (failure) throw failure.reason;
};
