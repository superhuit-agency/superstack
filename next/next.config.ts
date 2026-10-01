import type { NextConfig } from 'next';
import path from 'path';

const getWpUrl = () => process.env.WORDPRESS_URL ?? 'http://localhost';

const nextConfig: NextConfig = {
	trailingSlash: true, // to match wp links format and avoid many redirects
	env: {
		// Read by components shared with the WP theme to enable Next-only features (e.g. image optimisation)
		NEXT_PUBLIC_IS_THIS_NEXT: 'true',
	},
	async headers() {
		return [
			{
				source: '/wp-content/uploads/:path*',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=604800, stale-while-revalidate=86400',
					},
				],
			},
		];
	},
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
