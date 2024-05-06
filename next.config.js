const {
	getWpDomain,
	getWpUrl,
	getWpFormsSecret,
} = require('./src/utils/node-utils.js');

console.log('images domains:', getWpDomain());

/** @type {import('next').NextConfig} */
const nextConfig = {
	trailingSlash: true, // to match wp links format
	images: {
		remotePatterns: [
			{
				hostname: getWpDomain(),
			},
		],
	},
	rewrites() {
		const wpUrl = getWpUrl();
		const formSecrets = getWpFormsSecret();

		return [
			// Sitemap
			{
				source: '/sitemap:type*.xml',
				destination: `/api/sitemap`,
			},
			// Poxy for WP uploads to not expose the WP domain
			{
				source: '/wp-content/uploads/:path*',
				destination: `${wpUrl}/wp-content/uploads/:path*`,
			},
			// Proxy for WP forms
			{
				source: '/api/submit-form/',
				destination: `${wpUrl}/?spckforms-action=submit-form&spckforms-secret=${formSecrets}`,
			},
			{
				source: '/api/submit-form/upload/',
				destination: `${wpUrl}/?spckforms-action=upload-file&spckforms-secret=${formSecrets}`,
			},
		];
	},
};

module.exports = nextConfig;
