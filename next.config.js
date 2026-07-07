/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ],

  rewrites: async () => ({
    beforeFiles: [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ],
  }),

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              filename: '[name].[contenthash].js',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            common: {
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
              filename: 'commons.[contenthash].js',
            },
          },
        },
      };
    }

    return config;
  },

  experimental: {
    optimizePackageImports: ['@radix-ui/react-*'],
  },

  typescript: {
    tsconfigPath: './tsconfig.json',
  },

  eslint: {
    dirs: ['app', 'lib', 'prisma'],
  },

  productionBrowserSourceMaps: false,

  compress: true,

  poweredByHeader: false,

  redirects: async () => [
    {
      source: '/admin',
      destination: '/admin',
      permanent: false,
    },
  ],
};

module.exports = nextConfig;
