import configs from '@/configs.json';
import { fetchAPI } from '@/lib';
import { languageFields, translationsFields } from './fragments';

const GRAPHQL_MAX_SIZE = 100;

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
			uri: string;
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

	const typesNoIndex = (await fetchAPI(
		`query TypesNoIndex {
			seo {
				contentTypes {
					${contentTypes.nodes.map(
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
	})) as {
		seo: {
			contentTypes: { [key: string]: { metaRobotsNoindex: boolean } };
		};
	};

	return contentTypes.nodes.reduce(
		(postTypes: PostType[], type: ContentType) => {
			if (type.contentNodes.pageInfo.offsetPagination.total > 0) {
				if (
					typesNoIndex.seo.contentTypes[type.graphqlSingleName]
						.metaRobotsNoindex === false
				) {
					postTypes.push({
						name: type.graphqlPluralName,
						total: type.contentNodes.pageInfo.offsetPagination
							.total,
						lastModified: removeTimeFromDate(
							type.contentNodes.nodes[0].modified
						),
					});
				}
			}
			return postTypes;
		},
		[]
	);
}

async function getSitemapTypeUrls(type = 'posts', page = 1, size = 1000) {
	// TODO find how to get all images inside content (not only the feature image)
	let nodes: any[] = [];
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
										${configs.isMultilang ? ', language: DEFAULT' : ''}
										${type === 'pages' ? ', template: {notIn: ["template-404.php"]}' : ''}
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
											featuredImage {
												node {
													uri
													title
												}
											}
											seo {
												metaRobotsNoindex
											}
											${languageFields}
											${translationsFields}
										}
									}
								}
							}`
						)
					)
			)
		).forEach((result, i) => {
			if (result.status === 'fulfilled') {
				if (result.value[type].edges.length) {
					nodes = [...nodes, ...result.value[type].edges];
				}
			} else {
				console.error(
					`Can't fetch ${i * 100}-${
						(i + 1) * 100
					} sitemap ${type} urls`
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
					${configs.isMultilang ? ', language: DEFAULT' : ''}
					${type === 'pages' ? ', template: {notIn: ["template-404.php"]}' : ''}
					offsetPagination: {size: ${size}, offset: ${(page - 1) * size}}
				}
			) {
				edges {
					node {
						uri
						modified
						featuredImage {
							node {
								uri
								title
							}
						}
						${languageFields}
						${translationsFields}
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
	if (node.featuredImage) node.images.push(node.featuredImage.node);
	delete node.featuredImage;

	return node;
}

function parseNodeTranslations(node: NodeType) {
	if (configs.isMultilang) {
		const trs =
			node.translations?.filter((tr) => tr.uri && tr?.language?.code) ??
			[];
		node.translations = [
			{ uri: node.uri, code: node.language?.code },
			...trs.map(({ uri, language }) => ({
				uri,
				code: language?.code,
			})),
		];
		delete node.language;
	}
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
