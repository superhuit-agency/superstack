import * as _templatesData from '@/components/templates/data';
import configs from '@/configs.json';
import { fetchAPI, formatBlocksJSON } from '@/lib';

const templatesData: any = _templatesData;

const { singlePostData, singlePageData, singleCategoryData, singleTagData } =
	templatesData;

/**
 * NOTE: in preview, the `uri` could be in fact the ID (i.e. a draft doesn't have a slug/uri yet)
 *
 * @param {string}      uri
 * @param {boolean}     preview
 * @param {object}      auth
 * @param {null|string} lang
 * @param {boolean}     blockEnrichment - Whether to enrich the node with blocksJSON and templateData
 *
 * @returns
 */
export default async function getNodeByURI(
	uri: string,
	preview: boolean,
	auth: AuthType,
	lang: string,
	previewDraft: boolean,
	blockEnrichment = true
) {
	// uri = getUriWithoutPagination(uri); // Removes '/page/...' from uri if needed

	// The slug may be the id of an unpublished post
	const [match, id] = uri.match(/^(?:\/?\w{2})?\/(\d+)\/?/) || [];
	const isId = !!match;

	const variables: {
		isPreview: boolean;
		isPreviewDraft: boolean;
		id?: number;
		uri?: string;
	} = {
		isPreview: preview,
		isPreviewDraft: previewDraft,
	};

	if (isId) variables.id = Number.parseInt(id);
	else variables.uri = uri;

	const query = isId ? nodeByIdQuery(lang) : nodeByUriQuery(lang);

	let response = await fetchAPI(query, {
		variables,
		auth,
	});

	let { node, seo, generalSettings } = response;

	if (!node) return null;

	node.fullUri = uri; // Needed for the archive pagination

	/**
	 * Adjust node for Multilang
	 */
	if (configs.isMultilang) {
		const { __typename, translation } = node;
		node = { __typename, ...translation };

		// Update translations to push current uri in translations
		if (configs.hasCurrentLocaleInLangSwitcher) {
			if (!node.translations) node.translations = [];

			if (!node.language?.locale || !node.language?.code) return;

			node.translations.unshift({
				uri: node.uri,
				language: {
					locale: node.language.locale,
					code: node.language.code,
				},
			});
		}
	}

	/**
	 * Enrich & format node blocksJSON prop + archive
	 */
	if (blockEnrichment) {
		const { blocksJSON, templateData } = await Promise.allSettled([
			formatBlocksJSON(
				(previewDraft
					? node.preview?.node?.blocksJSON ?? ''
					: node?.blocksJSON ?? '') as string
			),
			getTemplateData(node),
		])
			.then(([bProm, tProm]) => ({
				blocksJSON: bProm.status === 'fulfilled' ? bProm.value : [],
				templateData: tProm.status === 'fulfilled' ? tProm.value : {},
			}))
			.catch(() => {
				console.error(
					'Error while enriching & formatting blocksJSON and templateData'
				);
				return { blocksJSON: [], templateData: {} };
			});

		if (node.preview) delete node.preview;

		return {
			...node,
			blocksJSON,
			...templateData,
			siteSEO: seo,
			siteSettings: generalSettings,
		};
	}

	return {
		...node,
		siteSEO: seo,
		siteSettings: generalSettings,
	};
}

const commonFields = `
	generalSettings {
		title
	}
	seo {
		schema {
			siteName
			siteUrl
			companyName
		}
		social {
			twitter {
				username
				cardType
			}
		}
		openGraph {
			defaultImage {
				src: sourceUrl
			}
		}
	}
`;

const types = [
	{
		type: 'Page',
		fragment: singlePageData.fragment,
		fields: 'singlePageFragment',
	},
	{
		type: 'Post',
		fragment: singlePostData.fragment,
		fields: 'singlePostFragment',
	},
	{
		type: 'Tag',
		fragment: singleTagData.fragment,
		fields: 'singleTagFragment',
	},
	{
		type: 'Category',
		fragment: singleCategoryData.fragment,
		fields: 'singleCategoryFragment',
	},
];

const nodeByUriQuery = (lang: string) => `
	query nodeByUriQuery(
		$uri: String!
		$isPreview: Boolean = false
		$isPreviewDraft: Boolean = false
	) {
		node: nodeByUri(uri: $uri) {
			__typename
			${types
				.map(({ type, fields }) =>
					configs.isMultilang
						? `...on ${type} {
					translation(language: ${lang}) {
						...${fields}
					}
				}`
						: `...${fields}`
				)
				.join('\n')}
		}
		${commonFields}
	}

	${types.map(({ fragment }) => fragment).join('\n')}
`;

const nodeByIdQuery = (lang: string) => `
	query nodeByIdQuery(
		$id: ID!
		$isPreview: Boolean = false
		$isPreviewDraft: Boolean = false
	) {
		node(id: $id, idType: DATABASE_ID) {
			__typename
			${types
				.map(({ type, fields }) =>
					configs.isMultilang
						? `...on ${type} {
					translation(language: ${lang}) {
						...${fields}
					}
				}`
						: `...${fields}`
				)
				.join('\n')}
		}
		${commonFields}
	}

	${types.map(({ fragment }) => fragment).join('\n')}
`;

const templatesDataList: any = {};
for (const key in templatesData) {
	if (
		Object.prototype.hasOwnProperty.call(templatesData, key) &&
		templatesData[key].slug
	) {
		const element = templatesData[key];
		templatesDataList[element.slug] = element;
	}
}

const getTemplateData = async (node: any) => {
	const type =
		node.archivePage && node.__typename === 'Page'
			? `archive-${node.archivePage.type}`
			: `single-${node.__typename}`.toLowerCase();

	const { getData } = templatesDataList?.[type] ?? {};

	if (!getData) return {};

	return await getData(fetchAPI, node);
};
