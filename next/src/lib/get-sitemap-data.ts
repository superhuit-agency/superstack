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
	uri: string;
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

	return await (type === 'all'
		? getIndexSitemapData()
		: getSitemapTypeUrls(type, page, size));
}

async function getIndexSitemapData() {
	// Lists each type's last-modified date
	cacheTag(cacheTags.content());

	const data = await fetchAPI(
		`query ContentTypes {
			contentTypes {
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
		if (node.seo.metaRobotsNoindex === 'index')
			urls.push(
				parseNodeTranslations(parseNodeImages(parseNodeDate(node)))
			);
		return urls;
	}, []);
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
