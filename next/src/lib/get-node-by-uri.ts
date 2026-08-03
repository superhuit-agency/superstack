import * as _templatesData from '@/components/templates/data';
import configs from '@/configs.json';
import { fetchAPI, formatBlocksJSON } from '@/lib';
import getBlockFinalComponentProps from '@/lib/get-block-final-component-props';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — file is gitignored and generated at dev/build time via predev/prebuild
import fseTemplatesData from '@/lib/fse/fse-templates-and-parts.json';

const templatesData: any = _templatesData;

const { archiveData, singlePageData, singlePostData } = templatesData;

/**
 * NOTE: in preview, the `uri` could be in fact the ID (i.e. a draft doesn't have a slug/uri yet)
 *
 * @param {string}      uri
 * @param {boolean}     preview
 * @param {object}      auth
 * @param {string|null} lang - The language code
 * @param {boolean}     previewDraft
 * @param {boolean}     blockEnrichment - Whether to enrich the node with blocksJSON and templateData
 * @param {number}      routePage
 *
 * @returns
 */
export default async function getNodeByURI(
	uri: string,
	preview: boolean,
	auth: AuthType,
	previewDraft: boolean,
	blockEnrichment = true,
	routePage = 1,
	lang: string | null = null
) {
	// Ensure URI includes language prefix if multilang is enabled
	if (configs.isMultilang && lang && !uri.startsWith(`/${lang}/`)) {
		uri = `/${lang}${uri.startsWith('/') ? '' : '/'}${uri}`;
	}

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

	const response = await fetchAPI(query, {
		variables,
		auth,
		headers: {
			'X-Query-Page': String(routePage && routePage > 0 ? routePage : 1),
		},
	});

	const { node: rawNode, seo, generalSettings } = response;

	if (!rawNode) return null;

	let node = rawNode;

	if (configs.isMultilang) {
		if (node.translation) {
			const { __typename } = node;
			node = { __typename, ...node.translation };
		} else if (lang && Array.isArray(node.translations)) {
			// Non-translatable nodes (ContentType archives) have no `language`
			// of their own — derive it from the requested lang so the rest of
			// the multilang handling (lang switcher, hreflang) works unchanged.
			const current = node.translations.find(
				(t: { language?: { code?: string } }) =>
					t.language?.code?.toLowerCase() === lang.toLowerCase()
			);

			if (current) {
				node = {
					...node,
					uri: current.uri,
					language: current.language,
					translations: node.translations.filter(
						(t: unknown) => t !== current
					),
				};
			}
		}

		if (configs.hasCurrentLocaleInLangSwitcher) {
			if (!node.translations) node.translations = [];
			if (!node.language?.locale || !node.language?.code) return null;

			node.translations.unshift({
				uri: node.uri,
				language: {
					locale: node.language.locale,
					code: node.language.code,
				},
			});
		}
	}

	node.fullUri = uri;

	if (blockEnrichment) {
		const { blocksJSON, templateData, templateBlocks } =
			await Promise.allSettled([
				formatBlocksJSON(
					previewDraft
						? (node.preview?.node?.blocksJSON ?? '')
						: (node?.blocksJSON ?? ''),
					{ lang }
				),
				getTemplateData(node),
				enrichTemplateBlocks(
					getTemplateBlocks(node?.fseTemplate?.slug, lang),
					lang
				),
			])
				.then(([bProm, tProm, tbProm]) => ({
					blocksJSON: bProm.status === 'fulfilled' ? bProm.value : [],
					templateData:
						tProm.status === 'fulfilled' ? tProm.value : {},
					templateBlocks:
						tbProm.status === 'fulfilled' ? tbProm.value : [],
				}))
				.catch(() => {
					console.error(
						'Error while enriching & formatting blocksJSON and templateData'
					);
					return {
						blocksJSON: [],
						templateData: {},
						templateBlocks: [],
					};
				});

		const blocks =
			templateBlocks.length > 0
				? injectPostContentBlocks(templateBlocks, blocksJSON)
				: blocksJSON;

		if (node.preview) delete node.preview;

		return {
			...node,
			blocks,
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
		type: 'ContentType',
		fragment: archiveData.fragment,
		fields: 'archiveFragment',
		// ContentType has no Polylang `translation` field — archives expose
		// per-language URIs via the custom `translations` field instead.
		translatable: false,
	},
	{
		type: 'Page',
		fragment: singlePageData.fragment,
		fields: 'singlePageFragment',
		translatable: true,
	},
	{
		type: 'Post',
		fragment: singlePostData.fragment,
		fields: 'singlePostFragment',
		translatable: true,
	},
];

const nodeByUriQuery = (lang: string | null) => `
	query nodeByUriQuery(
		$uri: String!
		$isPreview: Boolean = false
		$isPreviewDraft: Boolean = false
	) {
		node: nodeByUri(uri: $uri) {
			__typename
			${types
				.map(({ type, fields, translatable }) =>
					configs.isMultilang && lang && translatable
						? `...on ${type} {
					translation(language: ${lang.toUpperCase()}) {
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

const nodeByIdQuery = (lang: string | null) => `
	query nodeByIdQuery(
		$id: ID!
		$isPreview: Boolean = false
		$isPreviewDraft: Boolean = false
	) {
		node(id: $id, idType: DATABASE_ID) {
			__typename
			${types
				.map(({ type, fields, translatable }) =>
					configs.isMultilang && lang && translatable
						? `...on ${type} {
					translation(language: ${lang.toUpperCase()}) {
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
	const type = `single-${node.__typename}`.toLowerCase();

	const { getData } = templatesDataList?.[type] ?? {};

	if (!getData) return {};

	return await getData(fetchAPI, node);
};

/**
 * Injects the post content blocks into the template blocks
 * @param templateBlocks - The blocks of the template
 * @param pageBlocks - The blocks of the page
 * @returns
 */
const injectPostContentBlocks = (
	templateBlocks: BlockPropsType[],
	pageBlocks: any[]
): BlockPropsType[] =>
	templateBlocks.map((block) => {
		if (block.name === 'core/post-content') {
			return {
				...block,
				innerBlocks: pageBlocks,
			};
		}

		return {
			...block,
			innerBlocks: injectPostContentBlocks(
				block.innerBlocks ?? [],
				pageBlocks
			),
		};
	});

/**
 * Gets the blocks of the template from the FSE templates and parts data,
 * swapping in the `lang`-specific variant of any translated template part
 * (e.g. footer, header) before request-time enrichment runs.
 * @param templateSlug - The slug of the template
 * @param lang - The requested language code, if any
 * @returns
 */
const getTemplateBlocks = (
	templateSlug: string,
	lang: string | null = null
): BlockPropsType[] => {
	if (!templateSlug) return [];

	const fseTemplate: FseTemplateEntry | null =
		(fseTemplatesData as FseTemplatesData)?.templates?.find(
			(tpl) => tpl?.slug === templateSlug
		) ?? null;

	if (!fseTemplate?.blocks?.length) return [];

	return applyTemplatePartTranslations(
		fseTemplate.blocks.filter(Boolean) as BlockPropsType[],
		lang
	);
};

/**
 * Recursively swaps a `core/template-part` block's `innerBlocks` for its
 * `translations[lang]` variant, when one was baked into the JSON snapshot.
 * Falls back to the default (base-language) `innerBlocks` otherwise.
 */
const applyTemplatePartTranslations = (
	blocks: BlockPropsType[],
	lang: string | null
): BlockPropsType[] =>
	blocks.map((block) => {
		const translatedInnerBlocks =
			lang && block.name === 'core/template-part'
				? block.translations?.[lang]
				: undefined;

		return {
			...block,
			innerBlocks: applyTemplatePartTranslations(
				translatedInnerBlocks ?? block.innerBlocks ?? [],
				lang
			),
		};
	});

/**
 * Runs getData enrichment on template blocks at request time so dynamic data
 * (navigation, site logo, etc.) is always fresh and not baked in at build time.
 */
const enrichTemplateBlocks = (
	blocks: BlockPropsType[],
	lang: string | null = null
): Promise<BlockPropsType[]> =>
	blocks.length === 0
		? Promise.resolve([])
		: Promise.allSettled(
				blocks.map((block) =>
					getBlockFinalComponentProps(block, { lang })
				)
			).then(
				(results) =>
					results
						.map((r) => (r.status === 'fulfilled' ? r.value : null))
						.filter(Boolean) as BlockPropsType[]
			);
