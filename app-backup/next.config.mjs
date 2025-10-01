/** @type {import('next').NextConfig} */
const nextConfig = {
  // Multi-domain support for marketing site (strivetech.ai) and platform (app.strivetech.ai)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ];
  },

  // Host-based rewrites for dual-domain routing
  async rewrites() {
    return [
      // Marketing site (strivetech.ai) routes to (web) group
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'strivetech.ai',
          },
        ],
        destination: '/:path*', // Root page.tsx handles / via HostDependent
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.strivetech.ai',
          },
        ],
        destination: '/:path*', // Root page.tsx handles / via HostDependent
      },
      // Platform (app.strivetech.ai) routes to (platform) group
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'app.strivetech.ai',
          },
        ],
        destination: '/:path*', // Root page.tsx handles / via HostDependent
      },
    ];
  },

  // Image domains for both sites
  images: {
    domains: ['strivetech.ai', 'app.strivetech.ai', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
