/**
 * Decode a route segment: Next passes the page its params percent-encoded
 * (e.g. `%D0%BF…` for `п…`), while its metadata and `generateStaticParams`
 * get them decoded, and WordPress resolves only the decoded URI.
 * A malformed escape sequence is kept as it came.
 */
const decodeSegment = (segment: string) => {
	try {
		return decodeURIComponent(segment);
	} catch {
		return segment;
	}
};

export default function getWpUriFromNextPath(
	path: Array<string>
	// lang?: string,
	// defaultLocale?: string
) {
	let uri = path?.length ? `/${path.map(decodeSegment).join('/')}/` : `/`;

	// if (lang) uri = '/' + lang + uri;

	// // exception: in WordPress, the polylang option Hide URL language information for default language
	// //            ('hide_default') is set to FALSE
	// //            So the URI for the english homepage should be `/en/` but it currently is `/`
	// //            TODO: figure this out on wp side (it most likely has something to do with https://github.com/wp-graphql/wp-graphql/blob/6e93611b7e2c9c8ea0ecba979bbe650f7c87cddd/src/Model/Post.php#L610 - maybe wp-graphql-polylang should override something here)

	// if (defaultLocale && uri === `/${defaultLocale}/`) uri = `/`;

	return uri;
}
