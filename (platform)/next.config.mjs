/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable bundle analyzer when ANALYZE=true
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: './analyze.html',
            openAnalyzer: true,
          })
        );
      }
      return config;
    },
  }),

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
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
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

  // Image optimization
  images: {
    domains: ['strivetech.ai', 'app.strivetech.ai', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Compression
  compress: true,

  // Production optimizations
  productionBrowserSourceMaps: false,
  poweredByHeader: false,

  // Experimental features
  experimental: {
    // Enable instrumentation hook for startup validation
    instrumentationHook: true,
    // Optimize package imports for smaller bundles
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      '@tanstack/react-query',
      'recharts',
    ],
    // Server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Output options
  output: 'standalone', // For Docker/containerized deployments
};

export default nextConfig;
