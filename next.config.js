const {
	getWpUrl,
	getWpFormsSecret,
	getWpContentUrl,
	getImageDomains,
} = require('./src/utils/node-utils.js');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
});

console.log('images domains:', getWpDomain());

/** @type {import('next').NextConfig} */
const nextConfig = {
	trailingSlash: true, // to match wp links format
	images: {
		remotePatterns: getImageDomains().map((domain) => ({
			hostname: domain,
		})),
	},
	rewrites() {
		const wpUrl = getWpUrl();
		const wpContentUrl = getWpContentUrl();
		const formSecrets = getWpFormsSecret();

		return [
			// Sitemap
			{
				source: '/sitemap:type*.xml',
				destination: `/api/sitemap`,
			},
			// Proxy for WP uploads to not expose the WP domain
			{
				source: '/wp-content/uploads/:path*',
				destination: `${wpContentUrl}/uploads/:path*`,
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

module.exports = withBundleAnalyzer(nextConfig);
