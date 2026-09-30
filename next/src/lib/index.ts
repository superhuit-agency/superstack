import fetchAPI from './fetch-api';
import formatBlocksJSON from './format-blocks-json';

import getBlockFinalComponentProps from './get-block-final-component-props';
import getAllURIs from './get-all-uris';
import getAuthToken from './get-auth-token';

import {
	enrichTemplateBlocks,
	getTemplateBlocks,
} from './get-fse-template-blocks';
import getFunkyWpUploadsURI from './get-funky-wp-uploads-uri';
import { getPreviewNodeByURI, getPublicNodeByURI } from './get-node-by-uri';
import getNotFoundBreadcrumbs from './get-not-found-breadcrumbs';
import getWpUriFromNextPath from './get-wp-uri-from-next-path';

import getPreviewNode from './get-preview-node';
import getSitemapData from './get-sitemap-data';

import getRedirection from './get-redirection';
import injectBreadcrumbs from './inject-breadcrumbs';

export const PREVIEW_STATI = ['PUBLISH', 'DRAFT', 'FUTURE', 'PRIVATE'];

export {
	fetchAPI,
	formatBlocksJSON,
	getAllURIs,
	getAuthToken,
	getBlockFinalComponentProps,
	enrichTemplateBlocks,
	getTemplateBlocks,
	getFunkyWpUploadsURI,
	getNotFoundBreadcrumbs,
	getPreviewNode,
	getPreviewNodeByURI,
	getPublicNodeByURI,
	getSitemapData,
	getRedirection,
	getWpUriFromNextPath,
	injectBreadcrumbs,
};
