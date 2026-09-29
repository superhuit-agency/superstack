import { fetchAPI } from '@/lib';
import { getWpUrl } from '@/utils/node-utils';

const GRAPHQL_MAX_SIZE = 100;

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
	return await (type === 'all'
		? getIndexSitemapData()
		: getSitemapTypeUrls(type, page, size));
}

async function getIndexSitemapData() {
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
	).catch((error) => {
		console.error("Can't fetch sitemap content types");
		console.error(error);
	});

	if (
		!data ||
		typeof data !== 'object' ||
		!('contentTypes' in data) ||
		!data?.contentTypes
	)
		return null;

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
	).catch((error) => {
		console.error("Can't fetch sitemap noindex types");
		console.error(error);
	})) as
		| {
				seo: {
					contentTypes: {
						[key: string]: { metaRobotsNoindex: boolean };
					};
				};
		  }
		| undefined;

	if (!typesNoIndex?.seo?.contentTypes) return null;

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
	const featuredImageField = await getFeaturedImageField(type);
	if (size > GRAPHQL_MAX_SIZE) {
		(
			await Promise.allSettled(
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
											${featuredImageField}
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
			if (result.status === 'fulfilled') {
				const edges = result.value?.[type]?.edges;
				if (edges?.length) {
					nodes = [...nodes, ...edges];
				}
			} else {
				console.error(
					`Can't fetch ${i * 100}-${(i + 1) * 100} sitemap ${type} urls`
				);
				console.error(result.reason);
			}
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
						${featuredImageField}
						seo {
							metaRobotsNoindex
						}
					}
				}
			}
		}`
		).catch((error) => {
			console.error(`Can't fetch sitemap ${type} urls`);
			console.error(error);
		});

		nodes = data?.[type]?.edges ?? [];
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
 * Not every content type supports thumbnails, and querying `featuredImage`
 * on a type that doesn't implement `NodeWithFeaturedImage` fails the whole query.
 */
async function getFeaturedImageField(pluralName: string) {
	const data = await fetchAPI(
		`query SitemapFeaturedImageSupport {
			__type(name: "NodeWithFeaturedImage") {
				possibleTypes {
					name
				}
			}
			contentTypes {
				nodes {
					graphqlSingleName
					graphqlPluralName
				}
			}
		}`
	).catch((error) => {
		console.error("Can't fetch sitemap featured image support");
		console.error(error);
	});

	const singularName = data?.contentTypes?.nodes?.find(
		(type: { graphqlPluralName: string }) =>
			type.graphqlPluralName === pluralName
	)?.graphqlSingleName;

	if (!singularName) return '';

	const typeName =
		singularName.charAt(0).toUpperCase() + singularName.slice(1);
	const supported = data?.__type?.possibleTypes?.some(
		({ name }: { name: string }) => name === typeName
	);

	return supported
		? `featuredImage {
				node {
					sourceUrl
					title
				}
			}`
		: '';
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
