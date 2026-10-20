import { throwIfBaseUriNotDeclared } from '@/hooks/use-base-uri';

/**
 * The values of settled block-data promises, or the first failure rethrown.
 *
 * Outside preview, a block whose data fails fails the render, whatever the
 * error: it's never rendered on its attributes, dropped and then cached (see
 * docs/adr/0001-block-errors-fail-the-public-render.md). In preview, a block
 * only rejects with a `BaseUriNotDeclaredError`, which is rethrown first so
 * it isn't hidden behind another failure.
 */
const settledBlockDataOrThrow = <T>(
	results: PromiseSettledResult<T>[]
): T[] => {
	throwIfBaseUriNotDeclared(results);

	return results.map((result) => {
		if (result.status === 'rejected') throw result.reason;
		return result.value;
	});
};

export default settledBlockDataOrThrow;
