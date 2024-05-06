import configs from '@/configs.json';
import { languageFields } from './fragments/language';
import { fetchAPI } from '.';

const POST_TYPES = ['pages', 'posts'];
const TAXONOMIES = ['tags', 'categories'];

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

		const extraWhereArgs =
			postType === 'pages'
				? ',template: {notIn: "template-404.php"}'
				: '';

		for (let i = 0; i < nQueries; i++) {
			const query_name = `AllURIs_${postType}_${i + 1}_${nQueries}`;

			nodesPromises.push(
				fetchAPI(
					`query ${query_name} {
					${postType}(where: {offsetPagination: {offset: ${
						i * 100
					}, size: 100}${extraWhereArgs}}) {
						nodes {
							uri
							isRedirected
							${languageFields}
						}
					}
				}`
				)
			);
		}
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
						${languageFields}
					}
				}
			}`
			)
		);
	});

	const nodesQueries = await Promise.allSettled(nodesPromises);

	const nodes = nodesQueries.reduce<PromiseSettledResult<any>[]>(
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

	/**
	 * Multilang :: Remove lang from URI to return URI + LANG seperately
	 */
	const mapForMultilang = (node: {
		uri: string;
		language: { code: string };
	}) => ({
		params: {
			uri: node.uri
				.split('/')
				.filter((path: string) => path != '') // remove empty paths
				.slice(1), // + remove 1st element = lang
			lang: node.language
				? node.language.code.toLowerCase()
				: nodeCounts.defaultLanguage.slug,
		},
	});

	const mapForSingleLang = (node: { uri: string }) => ({
		uri: node.uri.split('/').filter((path: string) => path != ''), // remove empty paths
	});

	const callback: (node: any) => {} = configs.isMultilang
		? mapForMultilang
		: mapForSingleLang;

	return nodes.filter((node: any) => !node.isRedirected).map(callback);
}
