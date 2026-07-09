import configs from '@/configs.json';
import { fetchAPI } from '.';

const POST_TYPES: string[] = ['pages'];
const ARCHIVES: string[] = ['contentTypes']; // contentTypes are for archives but have no where arg — use first: 100
const TAXONOMIES: string[] = [];

type UriNode = {
	uri?: string;
	isRedirected?: boolean;
	language?: { code: string };
	translations?: Array<{ uri?: string; language?: { code: string } }>;
};

export default async function getAllURIs() {
	const nodeCounts = await fetchAPI(
		`query nodeCounts {
			${POST_TYPES.map(
				(postType) => `
				${postType} {
					pageInfo {
						offsetPagination {
							total
						}
					}
				}`
			)}
			${
				configs.isMultilang
					? `
				defaultLanguage {
					slug
				}
			`
					: ''
			}
		}`
	);

	const nodesPromises: Promise<any>[] = [];
	POST_TYPES.forEach((postType) => {
		const nQueries = Math.ceil(
			(nodeCounts?.[postType]?.pageInfo?.offsetPagination?.total ?? 0) /
				100
		);

		for (let i = 0; i < nQueries; i++) {
			const query_name = `AllURIs_${postType}_${i + 1}_${nQueries}`;

			nodesPromises.push(
				fetchAPI(
					`query ${query_name} {
					${postType}(where: {offsetPagination: {offset: ${i * 100}, size: 100}}) {
						nodes {
							uri
							isRedirected
							${
								configs.isMultilang
									? `language {
								code
							}`
									: ''
							}
						}
					}
				}`
				)
			);
		}
	});

	ARCHIVES.forEach((postType) => {
		nodesPromises.push(
			fetchAPI(
				`query AllURIs_${postType} {
				${postType}(first: 100) {
					nodes {
						uri
						isRedirected
						${
							configs.isMultilang
								? `translations {
							uri
							language {
								code
							}
						}`
								: ''
						}
					}
				}
			}`
			)
		);
	});

	// TODO: improve to handle more than 100 terms in each taxonomy
	TAXONOMIES.forEach((taxName) => {
		nodesPromises.push(
			fetchAPI(
				`query AllURIs_${taxName} {
				${taxName}(first: 100) {
					nodes {
						uri
						isRedirected
						${
							configs.isMultilang
								? `language {
							code
						}`
								: ''
						}
					}
				}
			}`
			)
		);
	});

	const nodesQueries = await Promise.allSettled(nodesPromises);

	const nodes = nodesQueries.reduce<UriNode[]>(
		(nodes, query) =>
			query.status !== 'fulfilled'
				? nodes
				: [
						...nodes,
						// @ts-ignore
						...(Object.values(query.value)[0]?.nodes || []),
					],
		[]
	);

	const mapForMultilang = (node: {
		uri: string;
		language: { code: string };
	}) => ({
		uri: node.uri
			.split('/')
			.filter((path: string) => path !== '')
			.slice(1), // remove first segment = lang prefix
		lang: node.language
			? node.language.code.toLowerCase()
			: nodeCounts.defaultLanguage.slug,
	});

	const mapForSingleLang = (node: { uri: string }) => ({
		uri: node.uri.split('/').filter((path: string) => path !== ''),
	});

	const callback: (node: any) => {} = configs.isMultilang
		? mapForMultilang
		: mapForSingleLang;

	// Archives (ContentType) have no language of their own: expand their
	// per-language `translations` (lang-prefixed URIs) into one node per language.
	const expandedNodes = configs.isMultilang
		? nodes.flatMap((node) =>
				!node.language && Array.isArray(node.translations)
					? node.translations
							.filter((t) => t?.uri)
							.map((t) => ({
								uri: t.uri,
								isRedirected: node.isRedirected,
								language: t.language,
							}))
					: [node]
			)
		: nodes;

	return expandedNodes
		.filter((node: any) => node.uri && !node.isRedirected)
		.map(callback);
}
