import fetchAPI from './fetch-api';
import formatBlocksJSON from './format-blocks-json';
import formatMenuItems from './format-menu-items';

import getBlockFinalComponentProps from './get-block-final-component-props';
import getAllURIs from './get-all-uris';
import { getAllMenus } from './get-all-menus';
import getAuthToken from './get-auth-token';

import getFunkyWpUploadsURI from './get-funky-wp-uploads-uri';
import getNodeByURI from './get-node-by-uri';
import getWpUriFromNextPath from './get-wp-uri-from-next-path';

import getPreviewNode from './get-preview-node';
import getSitemapData from './get-sitemap-data';

import getRedirection from './get-redirection';

export const PREVIEW_STATI = ['PUBLISH', 'DRAFT', 'FUTURE', 'PRIVATE'];

export {
	fetchAPI,
	formatMenuItems,
	formatBlocksJSON,
	getAllMenus,
	getAllURIs,
	getAuthToken,
	getBlockFinalComponentProps,
	getFunkyWpUploadsURI,
	getNodeByURI,
	getPreviewNode,
	getSitemapData,
	getRedirection,
	getWpUriFromNextPath,
};
