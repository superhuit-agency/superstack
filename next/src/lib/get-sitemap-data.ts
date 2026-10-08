import { cacheLife, cacheTag } from 'next/cache';

import { fetchAPI } from '@/lib';
import { cacheTags } from '@/lib/cache-tags';
import { getWpUrl } from '@/utils/node-utils';

const GRAPHQL_MAX_SIZE = 100;

// Not every content type supports thumbnails, and spreading
// `NodeWithFeaturedImage` on a type that can't implement it fails the whole
// query. Inside `ContentNode` the spread is valid for any type and only
// answers for the ones that implement it. No introspection needed: it is off
// for public requests on staging and production.
const FEATURED_IMAGE_FIELD = `... on ContentNode {
	... on NodeWithFeaturedImage {
		featuredImage {
			node {
				sourceUrl
				title
			}
		}
	}
}`;

// Content types registered by WordPress (FSE templates, navigation menus)
// that are not public content and are not exposed in `seo.contentTypes`.
const EXCLUDED_CONTENT_TYPES = ['Template', 'TemplatePart', 'NavigationMenu'];

// Taxonomies registered by WordPress that have no archive page.
const EXCLUDED_TAXONOMIES = ['postFormats'];

interface PostType {
	name: string;
	total: number;
	lastModified: string;
}

interface ContentType {
	graphqlSingleName: string;
	graphqlPluralName: string;
	contentNodes: {
		pageInfo: {
			offsetPagination: {
				total: number;
			};
		};
		nodes: {
			modified: string;
		}[];
	};
}

interface Taxonomy {
	name: string;
	graphqlPluralName: string;
}

interface TermConnectionType {
	pageInfo: {
		hasNextPage: boolean;
		endCursor: string | null;
	};
	nodes: TermType[];
}

interface TermType {
	uri: string | null;
	seo?: {
		metaRobotsNoindex: string;
	};
	contentNodes?: {
		nodes: {
			modified: string;
		}[];
	};
}

interface NodeType {
	modified: string;
	images?: {
		uri: string;
		title: string;
	}[];
	featuredImage?: {
		node: {
			sourceUrl: string;
			title: string;
		};
	};
	uri: string | null;
	link?: string | null;
	seo: {
		metaRobotsNoindex: string;
	};
	language?: {
		code: string;
	};
	translations?: {
		uri: string;
		language?: {
			code: string;
		};
		code?: string;
	}[];
}

export default async function getSitemapData(
	type = 'all',
	page = 1,
	size = 1000
) {
	try {
		return await getCachedSitemapData(type, page, size);
	} catch (error) {
		console.error(`Can't fetch sitemap ${type} data`);
		console.error(error);
		return null;
	}
}

/**
 * Cached per `(type, page)` until one of its tags is revalidated.
 * A failed request throws, so it is never cached as an empty sitemap.
 */
async function getCachedSitemapData(type: string, page: number, size: number) {
	'use cache';
	cacheLife('max');
	// Which types and posts are noindex comes from the SEO plugin's settings
	cacheTag(cacheTags.settings(), cacheTags.nodes());

	if (type === 'all') {
		const [contentTypes, taxonomies] = await Promise.all([
			getIndexSitemapData(),
			getIndexTaxonomiesSitemapData(),
		]);
		return [...contentTypes, ...taxonomies];
	}

	const taxonomy = (await getTaxonomies()).find(
		({ graphqlPluralName }) => graphqlPluralName === type
	);
	return await (taxonomy
		? getSitemapTaxonomyUrls(taxonomy, page, size)
		: getSitemapTypeUrls(type, page, size));
}

async function getIndexSitemapData() {
	// Lists each type's last-modified date
	cacheTag(cacheTags.content());

	const data = await fetchAPI(
		`query ContentTypes {
			contentTypes(first: 100) {
				nodes {
					graphqlSingleName
					graphqlPluralName
					contentNodes(where: {status: PUBLISH, orderby: {field: MODIFIED, order: DESC}}, first: 1) {
						nodes {
							modified
						}
						pageInfo {
							offsetPagination {
								total
							}
						}
					}
				}
			}
		}`
	);

	if (!data?.contentTypes) {
		throw new Error("Can't fetch sitemap content types");
	}

	const contentTypes = data.contentTypes as { nodes: ContentType[] };
	const indexableTypes = contentTypes.nodes.filter(
		(type: ContentType) =>
			!EXCLUDED_CONTENT_TYPES.includes(type.graphqlSingleName)
	);

	const typesNoIndex = (await fetchAPI(
		`query TypesNoIndex {
			seo {
				contentTypes {
					${indexableTypes.map(
						(type: ContentType) => `
						${type.graphqlSingleName} {
							metaRobotsNoindex
						}`
					)}
        }
			}
		}`
	)) as
		| {
				seo: {
					contentTypes: {
						[key: string]: { metaRobotsNoindex: boolean };
					};
				};
		  }
		| undefined;

	if (!typesNoIndex?.seo?.contentTypes) {
		throw new Error("Can't fetch sitemap noindex types");
	}

	return indexableTypes.reduce((postTypes: PostType[], type: ContentType) => {
		if (type.contentNodes.pageInfo.offsetPagination.total > 0) {
			if (
				typesNoIndex.seo.contentTypes[type.graphqlSingleName]
					?.metaRobotsNoindex === false
			) {
				postTypes.push({
					name: type.graphqlPluralName,
					total: type.contentNodes.pageInfo.offsetPagination.total,
					lastModified: removeTimeFromDate(
						type.contentNodes.nodes[0].modified
					),
				});
			}
		}
		return postTypes;
	}, []);
}

async function getSitemapTypeUrls(type = 'posts', page = 1, size = 1000) {
	// TODO find how to get all images inside content (not only the feature image)
	let nodes: any[] = [];
	const contentType = await getContentType(type);

	// Not a public content type: nothing to list, and nothing to query
	if (!contentType) {
		cacheTag(cacheTags.content());
		return [];
	}

	cacheTag(cacheTags.type(contentType.name));

	if (size > GRAPHQL_MAX_SIZE) {
		(
			await Promise.all(
				new Array(Math.ceil(size / GRAPHQL_MAX_SIZE))
					.fill(0)
					.map((v, i) =>
						fetchAPI(
							`query SitemapTypeUrls{
								${type}(
									where: {
										status: PUBLISH
										orderby: {field: DATE, order: ASC},
										offsetPagination: {size: ${GRAPHQL_MAX_SIZE}, offset: ${
											(page - 1) * size +
											i * GRAPHQL_MAX_SIZE
										}}
									}
								) {
									edges {
										node {
											uri
											link
											modified
											${FEATURED_IMAGE_FIELD}
											seo {
												metaRobotsNoindex
											}
										}
									}
								}
							}`
						)
					)
			)
		).forEach((result, i) => {
			const edges = result?.[type]?.edges;
			if (!Array.isArray(edges)) {
				throw new Error(
					`Can't fetch ${i * 100}-${(i + 1) * 100} sitemap ${type} urls`
				);
			}
			nodes = [...nodes, ...edges];
		});
	} else {
		const data = await fetchAPI(
			`query SitemapTypeUrls{
			${type}(
				first: 9999,
				where: {
					status: PUBLISH
					orderby: {field: DATE, order: ASC},
					offsetPagination: {size: ${size}, offset: ${(page - 1) * size}}
				}
			) {
				edges {
					node {
						uri
						link
						modified
						${FEATURED_IMAGE_FIELD}
						seo {
							metaRobotsNoindex
						}
					}
				}
			}
		}`
		);

		if (!Array.isArray(data?.[type]?.edges)) {
			throw new Error(`Can't fetch sitemap ${type} urls`);
		}

		nodes = data[type].edges;
	}

	return nodes.reduce((urls, { node }) => {
		node.uri = node.uri ?? getLinkUri(node.link);
		if (node.uri && node.seo.metaRobotsNoindex === 'index')
			urls.push(
				parseNodeTranslations(parseNodeImages(parseNodeDate(node)))
			);
		return urls;
	}, []);
}

async function getTaxonomies(): Promise<Taxonomy[]> {
	const data = await fetchAPI(
		`query SitemapTaxonomies {
			taxonomies(first: 100) {
				nodes {
					name
					graphqlPluralName
				}
			}
		}`
	);

	if (!data?.taxonomies?.nodes) {
		throw new Error("Can't fetch sitemap taxonomies");
	}

	return data.taxonomies.nodes.filter(
		({ graphqlPluralName }: Taxonomy) =>
			!EXCLUDED_TAXONOMIES.includes(graphqlPluralName)
	);
}

/**
 * Term connections don't support offset pagination,
 * so walk through every page with the cursor.
 */
async function getIndexableTerms({ name, graphqlPluralName }: Taxonomy) {
	// A term's last-modified date is its latest post's, and a term is only
	// listed while it has posts
	cacheTag(cacheTags.taxonomy(name), cacheTags.content());

	let terms: TermType[] = [];
	let after: string | null = null;

	do {
		const data: { [key: string]: TermConnectionType } | undefined =
			await fetchAPI(
				`query SitemapTaxonomyUrls($after: String) {
				${graphqlPluralName}(first: ${GRAPHQL_MAX_SIZE}, after: $after, where: { hideEmpty: true }) {
					pageInfo {
						hasNextPage
						endCursor
					}
					nodes {
						uri
						seo {
							metaRobotsNoindex
						}
						contentNodes(first: 1, where: { orderby: { field: MODIFIED, order: DESC } }) {
							nodes {
								modified
							}
						}
					}
				}
			}`,
				{ variables: { after } }
			);

		const connection: TermConnectionType | undefined =
			data?.[graphqlPluralName];
		if (!Array.isArray(connection?.nodes)) {
			throw new Error(`Can't fetch sitemap ${graphqlPluralName} urls`);
		}

		terms = [...terms, ...connection.nodes];
		after = connection.pageInfo?.hasNextPage
			? connection.pageInfo.endCursor
			: null;
	} while (after);

	return terms.reduce((urls: { uri: string; modified: string }[], term) => {
		const modified = term.contentNodes?.nodes?.[0]?.modified;
		if (term.uri && modified && term.seo?.metaRobotsNoindex === 'index')
			urls.push({
				uri: term.uri,
				modified: removeTimeFromDate(modified),
			});
		return urls;
	}, []);
}

async function getIndexTaxonomiesSitemapData() {
	const taxonomies = await getTaxonomies();

	const results = await Promise.all(
		taxonomies.map(async (taxonomy): Promise<PostType | null> => {
			const terms = await getIndexableTerms(taxonomy);
			if (!terms.length) return null;

			return {
				name: taxonomy.graphqlPluralName,
				total: terms.length,
				lastModified: terms
					.map(({ modified }) => modified)
					.sort()
					.reverse()[0],
			};
		})
	);

	return results.filter((result): result is PostType => result !== null);
}

async function getSitemapTaxonomyUrls(
	taxonomy: Taxonomy,
	page = 1,
	size = 1000
) {
	const terms = await getIndexableTerms(taxonomy);

	return terms.slice((page - 1) * size, page * size);
}

/**
 * The public content type behind a sitemap's plural name, for its `type:`
 * cache tag.
 */
async function getContentType(
	pluralName: string
): Promise<{ name: string } | null> {
	const data = await fetchAPI(
		`query SitemapContentType {
			contentTypes(first: 100) {
				nodes {
					name
					graphqlSingleName
					graphqlPluralName
				}
			}
		}`
	);

	if (!data?.contentTypes?.nodes) {
		throw new Error("Can't fetch sitemap content type");
	}

	const contentType = data.contentTypes.nodes.find(
		(type: { graphqlSingleName: string; graphqlPluralName: string }) =>
			type.graphqlPluralName === pluralName &&
			!EXCLUDED_CONTENT_TYPES.includes(type.graphqlSingleName)
	);

	return contentType ? { name: contentType.name } : null;
}

/**
 * Parse node modified date to remove time
 * (needed for sitemap format to be readable)
 */

function parseNodeDate(node: NodeType) {
	node.modified = removeTimeFromDate(node.modified);

	return node;
}

/**
 * Parse node to group all images into
 * single "flatten" property `images`.
 */
function parseNodeImages(node: NodeType) {
	node.images = [];
	if (node.featuredImage)
		node.images.push({
			uri: getUploadUri(node.featuredImage.node.sourceUrl),
			title: node.featuredImage.node.title,
		});
	delete node.featuredImage;

	return node;
}

/**
 * Keep only the path of a media URL, so it is served
 * through the `/wp-content/uploads/` proxy instead of the WP domain.
 */
function getUploadUri(sourceUrl: string) {
	try {
		return new URL(sourceUrl, getWpUrl()).pathname;
	} catch {
		return sourceUrl;
	}
}

/**
 * WPGraphQL returns a `null` uri for the page set as "Posts page",
 * so fall back on the path of its permalink.
 */
function getLinkUri(link?: string | null) {
	if (!link) return null;
	try {
		return new URL(link, getWpUrl()).pathname;
	} catch {
		return null;
	}
}

function parseNodeTranslations(node: NodeType) {
	return node;
}

/**
 * HELPERS
 */
function removeTimeFromDate(datetimestring: string) {
	const date = new Date(datetimestring);

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}
