import type { NextConfig } from 'next';
import path from 'path';

const getWpUrl = () => process.env.WORDPRESS_URL ?? 'http://localhost';

const nextConfig: NextConfig = {
	turbopack: {
		root: path.join(__dirname, '.'),
	},
	rewrites() {
		const wpUrl = getWpUrl();

		return [
			// Sitemap
			{
				source: '/sitemap.xml',
				destination: `/api/sitemap`,
			},
			{
				source: '/sitemap-:type.xml',
				destination: `/api/sitemap`,
			},
			// Proxy for WP uploads to not expose the WP domain
			{
				source: '/wp-content/uploads/:path*',
				destination: `${wpUrl}/wp-content/uploads/:path*`,
			},
		];
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'secure.gravatar.com',
			},
		],
	},
};

export default nextConfig;
