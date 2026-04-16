import type { NextConfig } from 'next';

import { getWpUrl } from '@/utils/node-utils';

const nextConfig: NextConfig = {
  rewrites() {
    const wpUrl = getWpUrl();

    return [
      // Poxy for WP uploads to not expose the WP domain
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
