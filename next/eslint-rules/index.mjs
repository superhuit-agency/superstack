import { noUnusedUsesBaseUri, requireUsesBaseUri } from './uses-base-uri.mjs';

const plugin = {
	meta: { name: 'superstack' },
	rules: {
		'require-uses-base-uri': requireUsesBaseUri,
		'no-unused-uses-base-uri': noUnusedUsesBaseUri,
	},
};

export default plugin;
