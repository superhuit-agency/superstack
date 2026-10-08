/**
 * The path and query of a redirect target taken from a query parameter, or
 * `/` when it would leave the site (`//evil.example`, `/\evil.example`,
 * `https://evil.example/`…).
 *
 * @param {string|null|undefined} target The URL or path to redirect to
 * @param {string}                origin The origin of the request
 */
export default function getSameOriginPath(
	target: string | null | undefined,
	origin: string
): string {
	if (!target) return '/';

	let url: URL;
	try {
		url = new URL(target, origin);
	} catch {
		return '/';
	}

	if (url.origin !== origin) return '/';

	return `${url.pathname}${url.search}`;
}
