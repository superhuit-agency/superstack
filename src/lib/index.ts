import fetchAPI from './fetch-api';
import formatBlocksJSON from './format-blocks-json';
import getAllURIs from './get-all-uris';
import getAuthToken from './get-auth-token';
import getBlockFinalComponentProps from './get-block-final-component-props';
import getFunkyWpUploadsURI from './get-funky-wp-uploads-uri';
import getNodeByURI from './get-node-by-uri';
import getPreviewNode from './get-preview-node';
import getRedirection from './get-redirection';
import getSitemapData from './get-sitemap-data';
import getWpUriFromNextPath from './get-wp-uri-from-next-path';

export const PREVIEW_STATI = ['PUBLISH', 'DRAFT', 'FUTURE', 'PRIVATE'];

export {
	fetchAPI,
	formatBlocksJSON,
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
