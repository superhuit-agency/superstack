import * as _templatesData from '@/components/templates/data';
import { fetchAPI, formatBlocksJSON } from '@/lib';

import fseTemplatesData from '@/lib/fse/fse-templates-and-parts.json';

const templatesData: any = _templatesData;

const { singlePageData, singlePostData } = templatesData;

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
  previewDraft: boolean,
  blockEnrichment = true,
  routePage = 1,
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

  const query = isId ? nodeByIdQuery() : nodeByUriQuery();

  const response = await fetchAPI(query, {
    variables,
    auth,
    headers: {
      'X-Query-Page': String(routePage && routePage > 0 ? routePage : 1),
    },
  });

  const { node, seo, generalSettings } = response;

  if (!node) return null;

  node.fullUri = uri; // Needed for the archive pagination

  /**
   * Enrich & format node blocksJSON prop + archive
   */
  if (blockEnrichment) {
    const { blocksJSON, templateData } = await Promise.allSettled([
      formatBlocksJSON(
        previewDraft
          ? (node.preview?.node?.blocksJSON ?? '')
          : (node?.blocksJSON ?? ''),
      ),
      getTemplateData(node),
    ])
      .then(([bProm, tProm]) => ({
        blocksJSON: bProm.status === 'fulfilled' ? bProm.value : [],
        templateData: tProm.status === 'fulfilled' ? tProm.value : {},
      }))
      .catch(() => {
        console.error(
          'Error while enriching & formatting blocksJSON and templateData',
        );
        return {
          blocksJSON: [],
          templateData: {},
        };
      });

    const templateBlocks = getTemplateBlocks(node?.fseTemplate?.slug);
    const blocks =
      templateBlocks.length > 0
        ? injectPostContentBlocks(templateBlocks, blocksJSON)
        : blocksJSON;

    if (node.preview) delete node.preview;

    return {
      ...node,
      // blocksJSON,
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
    type: 'Page',
    fragment: singlePageData.fragment,
    fields: 'singlePageFragment',
  },
  {
    type: 'Post',
    fragment: singlePostData.fragment,
    fields: 'singlePostFragment',
  },
];

const nodeByUriQuery = () => `
	query nodeByUriQuery(
		$uri: String!
		$isPreview: Boolean = false
		$isPreviewDraft: Boolean = false
	) {
		node: nodeByUri(uri: $uri) {
			__typename
			${types.map(({ fields }) => `...${fields}`).join('\n')}
		}
		${commonFields}
	}

	${types.map(({ fragment }) => fragment).join('\n')}
`;

const nodeByIdQuery = () => `
	query nodeByIdQuery(
		$id: ID!
		$isPreview: Boolean = false
		$isPreviewDraft: Boolean = false
	) {
		node(id: $id, idType: DATABASE_ID) {
			__typename
			${types.map(({ fields }) => `...${fields}`).join('\n')}
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

/**
 * Injects the post content blocks into the template blocks
 * @param templateBlocks - The blocks of the template
 * @param pageBlocks - The blocks of the page
 * @returns
 */
const injectPostContentBlocks = (
  templateBlocks: BlockPropsType[],
  pageBlocks: any[],
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
      innerBlocks: injectPostContentBlocks(block.innerBlocks ?? [], pageBlocks),
    };
  });

/**
 * Gets the blocks of the template from the FSE templates and parts data
 * @param templateSlug - The slug of the template
 * @returns
 */
const getTemplateBlocks = (templateSlug: string): BlockPropsType[] => {
  if (!templateSlug) return [];

  const fseTemplate =
    fseTemplatesData?.templates?.find(
      (tpl: any) => tpl?.slug === templateSlug,
    ) ?? null;

  if (!fseTemplate?.blocks?.length) return [];

  return fseTemplate.blocks;
};
