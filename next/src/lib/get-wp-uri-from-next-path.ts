import { decodePath } from '@/lib/cache-tags';

/**
 * Next passes the page its params percent-encoded (e.g. `%D0%BF…` for `п…`),
 * and WordPress resolves only the decoded URI. Each segment is decoded like
 * `decodePath()`: an encoded `/`, `?` or `#` stays encoded, so it can't split
 * the segment or cut the URI short for WordPress (`/company%3Fx/` would
 * otherwise resolve to `/company/`). A malformed escape sequence is kept as it
 * came.
 */
export default function getWpUriFromNextPath(
	path: Array<string>
	// lang?: string,
	// defaultLocale?: string
) {
	let uri = path?.length ? `/${path.map(decodePath).join('/')}/` : `/`;

	// if (lang) uri = '/' + lang + uri;

	// // exception: in WordPress, the polylang option Hide URL language information for default language
	// //            ('hide_default') is set to FALSE
	// //            So the URI for the english homepage should be `/en/` but it currently is `/`
	// //            TODO: figure this out on wp side (it most likely has something to do with https://github.com/wp-graphql/wp-graphql/blob/6e93611b7e2c9c8ea0ecba979bbe650f7c87cddd/src/Model/Post.php#L610 - maybe wp-graphql-polylang should override something here)

	// if (defaultLocale && uri === `/${defaultLocale}/`) uri = `/`;

	return uri;
}
